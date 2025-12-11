import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Serviço de Collection
 * Gerencia operações de Collection
 */
@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Criar novo Collection
   */
  async create(data: any) {
    // TODO: Implementar validações específicas
    const collection = await this.prisma.collection.create({
      data,
    });
    return collection;
  }

  /**
   * Listar Collections com paginação
   */
  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [collections, total] = await Promise.all([
      this.prisma.collection.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.collection.count(),
    ]);

    return {
      data: collections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Buscar Collection por ID
   */
  async findOne(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      throw new NotFoundException('Collection não encontrado');
    }

    return collection;
  }

  /**
   * Atualizar Collection
   */
  async update(id: string, data: any) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      throw new NotFoundException('Collection não encontrado');
    }

    const updated = await this.prisma.collection.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * Deletar Collection
   */
  async remove(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      throw new NotFoundException('Collection não encontrado');
    }

    await this.prisma.collection.delete({
      where: { id },
    });

    return { message: 'Collection deletado com sucesso' };
  }
}
