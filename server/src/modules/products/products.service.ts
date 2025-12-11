import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Serviço de Product
 * Gerencia operações de Product
 */
@Injectable()
export class ProductsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService
  ) { }

  /**
   * Criar novo Product
   */
  /**
   * Criar novo Product
   */
  async create(data: any) {
    const { variants, images, ...productData } = data;

    const createData: any = {
      ...productData,
    };

    if (variants && Array.isArray(variants) && variants.length > 0) {
      createData.variants = {
        create: variants.map(v => ({
          size: v.size,
          color: v.color || 'Padrão',
          sku: v.sku || `${productData.sku}-${v.size}`,
          stock: parseInt(v.stock) || 0
        }))
      };
    }

    if (images && Array.isArray(images) && images.length > 0) {
      createData.images = {
        create: images.map((img, idx) => ({
          url: img.url,
          altText: img.altText || productData.name,
          order: idx
        }))
      };
    }

    const product = await this.prisma.product.create({
      data: createData,
      include: { variants: true, images: true }
    });
    return product;
  }

  /**
   * Listar Products com paginação e filtros
   */
  async findAll(page: number = 1, limit: number = 20, filters?: any) {
    const skip = (page - 1) * limit;
    const where: any = { isActive: true };

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.minPrice || filters?.maxPrice) {
      where.priceInCents = {};
      if (filters?.minPrice) where.priceInCents.gte = filters.minPrice;
      if (filters?.maxPrice) where.priceInCents.lte = filters.maxPrice;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: true,
          variants: true,
          attributes: true,
          category: true,
          collection: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Buscar produtos em destaque
   */
  async getFeatured(limit: number = 8) {
    return this.prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
        variants: true,
        attributes: true,
        category: true,
        collection: true,
      },
    });
  }

  /**
   * Buscar produto por slug
   */
  async findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        variants: true,
        attributes: true,
        category: true,
        collection: true,
      },
    });
  }

  /**
   * Buscar Product por ID
   */
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variants: true,
      }
    });

    if (!product) {
      throw new NotFoundException('Product não encontrado');
    }

    return product;
  }

  /**
   * Atualizar Product
   */
  async update(id: string, data: any) {
    const { variants, images, ...productData } = data;

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true, images: true }
    });

    if (!product) {
      throw new NotFoundException('Product não encontrado');
    }

    // Handle Variants Sync if provided
    let variantsUpdate = undefined;
    if (variants && Array.isArray(variants)) {
      // IDs sent in the update payload
      const sentIds = variants.filter(v => v.id).map(v => v.id);
      // IDs currently in DB
      const currentIds = product.variants.map(v => v.id);

      // Determine what to delete (in DB but not in payload)
      const toDelete = currentIds.filter(id => !sentIds.includes(id));

      variantsUpdate = {
        deleteMany: {
          id: { in: toDelete }
        },
        upsert: variants.map(v => ({
          where: { id: v.id || 'new-uuid' }, // 'new-uuid' fails look up, forcing create
          update: {
            size: v.size,
            color: v.color,
            stock: parseInt(v.stock),
            sku: v.sku
          },
          create: {
            size: v.size,
            color: v.color || 'Padrão',
            stock: parseInt(v.stock),
            sku: v.sku || `${productData.sku || product.sku}-${v.size}`
          }
        }))
      };
    }

    // Handle Images Sync if provided
    let imagesUpdate = undefined;
    if (images && Array.isArray(images)) {
      const sentIds = images.filter(i => i.id).map(i => i.id);
      const currentIds = product.images.map(i => i.id);
      const toDelete = currentIds.filter(id => !sentIds.includes(id));

      imagesUpdate = {
        deleteMany: {
          id: { in: toDelete }
        },
        upsert: images.map((img, idx) => ({
          where: { id: img.id || 'new-uuid' },
          update: {
            url: img.url,
            altText: img.altText || productData.name,
            order: idx
          },
          create: {
            url: img.url,
            altText: img.altText || productData.name,
            order: idx
          }
        }))
      };
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        variants: variantsUpdate,
        images: imagesUpdate
      },
      include: { variants: true, images: true }
    });

    return updated;
  }

  /**
   * Deletar Product
   */
  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product não encontrado');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Product deletado com sucesso' };
  }
}
