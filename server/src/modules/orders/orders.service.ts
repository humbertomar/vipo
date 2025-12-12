import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Serviço de Order
 * Gerencia operações de Order
 */
@Injectable()
export class OrdersService {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService
  ) { }

  /**
   * Criar novo Order
   */

  async create(data: any) {
    // Extract fields that are not part of the Order model
    const { items, paymentMethod, type, ...orderData } = data;

    // Generate Order Number
    const orderNumber = `ORD-${Date.now()}`;

    // Calculate totals if not provided
    const totalInCents = items.reduce((acc: number, item: any) => acc + (item.priceInCents * item.quantity), 0);

    // Determines status based on Order Type (POS or Online)
    const initialStatus = type === 'POS' ? 'CONFIRMED' : 'PENDING';
    const initialPaymentStatus = (type === 'POS' || paymentMethod === 'CASH' || paymentMethod?.startsWith?.('POS')) ? 'CAPTURED' : 'PENDING';

    // Use transaction to ensure stock integrity
    return await this.prisma.$transaction(async (tx) => {
      // 1. Process items (check stock & decrement)
      const orderItemsData = [];

      for (const item of items) {
        // Find variant to check stock
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true }
        });

        if (!variant) {
          throw new BadRequestException(`Variante ${item.variantId} não encontrada`);
        }

        if (variant.stock < item.quantity) {
          throw new BadRequestException(`Estoque insuficiente para o produto ${variant.product.name} (${variant.size}). Disponível: ${variant.stock}`);
        }

        // Decrement variant stock
        const updatedVariant = await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: { decrement: item.quantity } }
        });

        // Garantir que o estoque não fique negativo
        if (updatedVariant.stock < 0) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stock: 0 }
          });
        }

        // Decrement product total stock
        const updatedProduct = await tx.product.update({
          where: { id: variant.productId },
          data: { totalStock: { decrement: item.quantity } },
          select: { totalStock: true }
        });

        // Garantir que o estoque total não fique negativo
        if (updatedProduct.totalStock < 0) {
          await tx.product.update({
            where: { id: variant.productId },
            data: { totalStock: 0 }
          });
        }

        orderItemsData.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          priceInCents: item.priceInCents,
        });
      }

      // 2. Create Order (without invalid fields)
      const order = await tx.order.create({
        data: {
          ...orderData,
          orderNumber,
          subtotalInCents: totalInCents,
          totalInCents: totalInCents,
          status: initialStatus,
          items: {
            create: orderItemsData,
          },
        },
      });

      // 3. Create Payment Record if method is provided
      if (paymentMethod) {
        await tx.payment.create({
          data: {
            orderId: order.id,
            amountInCents: totalInCents,
            method: paymentMethod,
            status: initialPaymentStatus,
          }
        });
      }

      // Return order with items and payment
      return await tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: { product: true, variant: true }
          },
          payment: true,
          user: true
        }
      });
    });
  }

  /**
   * Listar Orders com paginação
   */
  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: { product: true, variant: true }
          },
          user: true,
          payment: true,
        }
      }),
      this.prisma.order.count(),
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Buscar Order por ID
   */
  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true, variant: true }
        },
        user: true,
        payment: true,
      }
    });

    if (!order) {
      throw new NotFoundException('Order não encontrado');
    }

    return order;
  }

  /**
   * Atualizar Order
   */
  async update(id: string, data: any) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order não encontrado');
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data,
      include: { // Also include relation on update for consistency
        items: true,
        payment: true
      }
    });

    return updated;
  }

  /**
   * Deletar Order
   */
  async remove(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order não encontrado');
    }

    await this.prisma.order.delete({
      where: { id },
    });

    return { message: 'Order deletado com sucesso' };
  }
}
