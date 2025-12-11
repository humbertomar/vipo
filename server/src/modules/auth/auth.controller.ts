import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * Controller de auth
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Get()
  findAll() {
    // TODO: Implementar
    return [];
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // TODO: Implementar
    return {};
  }

  @Post()
  create(@Body() data: any) {
    // TODO: Implementar
    return {};
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    // TODO: Implementar
    return {};
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // TODO: Implementar
    return {};
  }
}
