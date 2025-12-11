
import { Controller, Get, Post, Put, Delete, Param, Body, Query, Inject } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('api/products')
// Products Controller
export class ProductsController {
  constructor(
    @Inject(ProductsService) private readonly productsService: ProductsService
  ) { }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const filters: any = {};

    if (search) filters.search = search;
    if (categoryId) filters.categoryId = categoryId;
    if (minPrice) filters.minPrice = parseInt(minPrice);
    if (maxPrice) filters.maxPrice = parseInt(maxPrice);

    return this.productsService.findAll(pageNum, limitNum, filters);
  }

  @Get('featured')
  async getFeatured(@Query('limit') limit: string = '8') {
    return this.productsService.getFeatured(parseInt(limit) || 8);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.productsService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.productsService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
