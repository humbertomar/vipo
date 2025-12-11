import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('api/addresses')
export class AddressesController {
    constructor(private readonly service: AddressesService) { }

    @Get('user/:userId')
    async findAllByUser(@Param('userId') userId: string) {
        const addresses = await this.service.findAllByUser(userId);
        return { data: addresses };
    }

    @Post('user/:userId')
    async create(
        @Param('userId') userId: string,
        @Body() data: CreateAddressDto
    ) {
        const address = await this.service.create(userId, data);
        return { data: address };
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() data: UpdateAddressDto
    ) {
        const address = await this.service.update(id, data);
        return { data: address };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
