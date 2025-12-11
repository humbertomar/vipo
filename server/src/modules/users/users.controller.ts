import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

/**
 * Controller de users (Clientes)
 */
@Controller('api/users')
export class UsersController {
  constructor(@Inject(UsersService) private readonly service: UsersService) { }

  @Get()
  async findAll() {
    return {
      data: await this.service.findAll()
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      data: await this.service.findOne(id)
    };
  }

  @Post()
  async create(@Body() data: CreateCustomerDto) {
    return {
      data: await this.service.create(data)
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateCustomerDto) {
    return {
      data: await this.service.update(id, data)
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
