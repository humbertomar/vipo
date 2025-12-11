import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Serviço de Coupon
 * Gerencia operações de Coupon
 */
@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Criar novo Coupon
   */
  async create(data: any) {
    // TODO: Implementar validações específicas
    const coupon = await this.prisma.coupon.create({
      data,
    });
    return coupon;
  }

  /**
   * Listar Coupons com paginação
   */
  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [coupons, total] = await Promise.all([
      this.prisma.coupon.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.coupon.count(),
    ]);

    return {
      data: coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Buscar Coupon por ID
   */
  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon não encontrado');
    }

    return coupon;
  }

  /**
   * Atualizar Coupon
   */
  async update(id: string, data: any) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon não encontrado');
    }

    const updated = await this.prisma.coupon.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * Deletar Coupon
   */
  async remove(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon não encontrado');
    }

    await this.prisma.coupon.delete({
      where: { id },
    });

    return { message: 'Coupon deletado com sucesso' };
  }
}
