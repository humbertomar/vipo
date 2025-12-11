import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
    constructor(private prisma: PrismaService) { }

    async findAllByUser(userId: string) {
        return this.prisma.address.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async create(userId: string, data: CreateAddressDto) {
        // Se for o primeiro endereço ou marcado como default, atualizar lógica poderia ser necessária
        // Para simplicidade, apenas cria
        return this.prisma.address.create({
            data: {
                ...data,
                userId
            }
        });
    }

    async update(id: string, data: UpdateAddressDto) {
        const address = await this.prisma.address.findUnique({ where: { id } });

        if (!address) {
            throw new NotFoundException('Address not found');
        }

        return this.prisma.address.update({
            where: { id },
            data
        });
    }

    async remove(id: string) {
        const address = await this.prisma.address.findUnique({ where: { id } });

        if (!address) {
            throw new NotFoundException('Address not found');
        }

        await this.prisma.address.delete({
            where: { id }
        });

        return { message: 'Address deleted' };
    }
}
