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

    // Se houver variações, calcula o estoque total automaticamente
    let totalStock: number;
    if (variants && Array.isArray(variants) && variants.length > 0) {
      // Calcula a soma dos estoques das variações
      totalStock = variants.reduce((sum, v) => {
        const stock = Math.max(0, parseInt(v.stock) || 0);
        return sum + stock;
      }, 0);
    } else {
      // Se não houver variações, usa o valor informado
      totalStock = Math.max(0, parseInt(productData.totalStock) || 0);
    }

    const createData: any = {
      ...productData,
      totalStock,
    };

    if (variants && Array.isArray(variants) && variants.length > 0) {
      createData.variants = {
          create: variants.map(v => ({
          size: v.size,
          color: v.color || 'Padrão',
          sku: v.sku || (productData.sku ? `${productData.sku}-${v.size}` : null),
          stock: Math.max(0, parseInt(v.stock) || 0) // Garante que não seja negativo
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
    let calculatedTotalStock: number | undefined = undefined;
    
    if (variants && Array.isArray(variants)) {
      // IDs sent in the update payload
      const sentIds = variants.filter(v => v.id).map(v => v.id);
      // IDs currently in DB
      const currentIds = product.variants.map(v => v.id);

      // Determine what to delete (in DB but not in payload)
      const toDelete = currentIds.filter(id => !sentIds.includes(id));

      // Calcula o estoque total baseado nas variações
      calculatedTotalStock = variants.reduce((sum, v) => {
        const stock = Math.max(0, parseInt(v.stock) || 0);
        return sum + stock;
      }, 0);

      variantsUpdate = {
        deleteMany: {
          id: { in: toDelete }
        },
        upsert: variants.map(v => ({
          where: { id: v.id || 'new-uuid' }, // 'new-uuid' fails look up, forcing create
          update: {
            size: v.size,
            color: v.color,
            stock: Math.max(0, parseInt(v.stock) || 0), // Garante que não seja negativo
            sku: v.sku || null
          },
          create: {
            size: v.size,
            color: v.color || 'Padrão',
            stock: Math.max(0, parseInt(v.stock) || 0), // Garante que não seja negativo
            sku: v.sku || (productData.sku || product.sku ? `${productData.sku || product.sku}-${v.size}` : null)
          }
        }))
      };
    }

    // Se houver variações, usa o estoque calculado; senão, usa o informado
    if (calculatedTotalStock !== undefined) {
      productData.totalStock = calculatedTotalStock;
    } else if (productData.totalStock !== undefined) {
      productData.totalStock = Math.max(0, parseInt(productData.totalStock) || 0);
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
      include: {
        orderItems: true,
        variants: {
          include: {
            cartItems: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product não encontrado');
    }

    // Verifica se o produto está em pedidos
    if (product.orderItems && product.orderItems.length > 0) {
      throw new BadRequestException(
        'Não é possível deletar um produto que está associado a pedidos. Considere desativar o produto em vez de deletá-lo.'
      );
    }

    // Verifica se há variantes no carrinho
    if (product.variants && product.variants.length > 0) {
      const hasCartItems = product.variants.some(
        (variant) => variant.cartItems && variant.cartItems.length > 0
      );
      if (hasCartItems) {
        throw new BadRequestException(
          'Não é possível deletar um produto que está no carrinho de algum cliente. Considere desativar o produto em vez de deletá-lo.'
        );
      }
    }

    // Deleta relacionamentos que não têm onDelete: Cascade
    await this.prisma.$transaction(async (tx) => {
      // Deleta variants (CartItems serão removidos automaticamente se houver onDelete: Cascade)
      await tx.productVariant.deleteMany({
        where: { productId: id },
      });

      // Deleta attributes
      await tx.productAttribute.deleteMany({
        where: { productId: id },
      });

      // Deleta inventory movements
      await tx.inventoryMovement.deleteMany({
        where: { productId: id },
      });

      // Deleta o produto (images serão deletadas automaticamente por onDelete: Cascade)
      await tx.product.delete({
        where: { id },
      });
    });

    return { message: 'Product deletado com sucesso' };
  }
}
