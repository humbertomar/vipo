import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Serviço de Carrinho (Cart)
 * Gerencia o carrinho de compras do usuário.
 */
@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) { }

  /**
   * Encontrar ou criar carrinho para o usuário
   */
  async findByUser(userId: string) {
    let cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: { product: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    }

    return cart;
  }

  /**
   * Adicionar item ao carrinho
   */
  async addItem(userId: string, data: { variantId: string; productId: string; quantity: number }) {
    const { variantId, quantity } = data;

    if (quantity <= 0) {
      throw new BadRequestException('Quantidade deve ser maior que zero.');
    }

    // Garante que o carrinho existe
    const cart = await this.findByUser(userId);

    // Verifica se item já existe
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId
      }
    });

    if (existingItem) {
      // Atualiza quantidade
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      // Cria novo item
      // Opcional: Verificar estoque da variante antes de adicionar
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity
        }
      });
    }

    // Retorna carrinho atualizado
    return this.findByUser(userId);
  }

  /**
   * Atualizar quantidade do item
   */
  async updateItem(userId: string, itemId: string, data: { quantity: number }) {
    const { quantity } = data;

    // Verificar se item pertence ao carrinho do usuário
    const cart = await this.findByUser(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id }
    });

    if (!item) {
      throw new NotFoundException('Item não encontrado no carrinho.');
    }

    if (quantity <= 0) {
      return this.removeItem(userId, itemId);
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    });

    return this.findByUser(userId);
  }

  /**
   * Remover item
   */
  async removeItem(userId: string, itemId: string) {
    const cart = await this.findByUser(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id }
    });

    if (!item) {
      throw new NotFoundException('Item não encontrado no carrinho.');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId }
    });

    return this.findByUser(userId);
  }

  /**
   * Limpar carrinho
   */
  async clearCart(userId: string) {
    const cart = await this.findByUser(userId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    return { message: 'Cart cleared' };
  }
}
