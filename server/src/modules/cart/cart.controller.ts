import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { CartService } from './cart.service';

/**
 * Controller de Cart
 */
@Controller('api/cart')
export class CartController {
  constructor(private readonly service: CartService) { }

  @Get(':userId')
  async findByUser(@Param('userId') userId: string) {
    const cart = await this.service.findByUser(userId);
    return { data: cart };
  }

  @Post(':userId/items')
  async addItem(
    @Param('userId') userId: string,
    @Body() data: { variantId: string; productId: string; quantity: number }
  ) {
    const cart = await this.service.addItem(userId, data);
    return { data: cart };
  }

  @Put(':userId/items/:itemId')
  async updateItem(
    @Param('userId') userId: string,
    @Param('itemId') itemId: string,
    @Body() data: { quantity: number }
  ) {
    const cart = await this.service.updateItem(userId, itemId, data);
    return { data: cart };
  }

  @Delete(':userId/items/:itemId')
  async removeItem(
    @Param('userId') userId: string,
    @Param('itemId') itemId: string
  ) {
    const cart = await this.service.removeItem(userId, itemId);
    return { data: cart };
  }

  @Delete(':userId/clear')
  async clearCart(@Param('userId') userId: string) {
    return this.service.clearCart(userId);
  }
}
