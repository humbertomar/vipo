import { Controller, Get, Post, Body, Param, Put, Delete, Query, Inject } from '@nestjs/common';
import { OrdersService } from './orders.service';

/**
 * Controller de Order
 */
@Controller('api/orders')
export class OrdersController {
  constructor(
    @Inject(OrdersService) private readonly service: OrdersService
  ) { }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const { data, meta } = await this.service.findAll(parseInt(page), parseInt(limit));

    // Map paymentMethod to top level
    const mappedData = data.map((order: any) => ({
      ...order,
      paymentMethod: order.payment?.method
    }));

    return {
      data: mappedData,
      meta
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order: any = await this.service.findOne(id);

    return {
      data: {
        ...order,
        paymentMethod: order.payment?.method
      }
    };
  }

  @Post()
  async create(@Body() data: any) {
    const order: any = await this.service.create(data);

    return {
      data: {
        ...order,
        paymentMethod: order.payment?.method
      }
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
