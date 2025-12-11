import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { UserRole } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

/**
 * Serviço de users (Foco em Clientes)
 */
@Injectable()
export class UsersService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) { }

  /**
   * Listar clientes (role = CUSTOMER)
   */
  async findAll() {
    return this.prisma.user.findMany({
      where: {
        role: UserRole.CUSTOMER,
        isActive: true,
      },
      include: {
        customerProfile: true,
        addresses: {
          where: { isDefault: true },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Buscar cliente por ID
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        customerProfile: true,
        addresses: true
      },
    });

    if (!user || user.role !== UserRole.CUSTOMER || !user.isActive) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    return user;
  }

  /**
   * Criar novo cliente
   * Cria registro em User, CustomerProfile e Address (opcional)
   */
  async create(data: CreateCustomerDto) {
    const { name, email, phone, address } = data;

    // Verificar se email já existe
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email já cadastrado.');
    }

    // Gerar openId único (necessário pelo schema)
    const openId = `manual_${randomUUID()}`;

    // Preparar dados de criação
    const createData: any = {
      email,
      name,
      openId,
      role: UserRole.CUSTOMER,
      customerProfile: {
        create: {
          phone
        },
      }
    };

    if (address) {
      createData.addresses = {
        create: {
          ...address,
          country: 'BR',
          isDefault: true,
          label: 'Principal'
        }
      };
    }

    return await this.prisma.user.create({
      data: createData,
      include: {
        customerProfile: true,
        addresses: true
      },
    });
  }

  /**
   * Atualizar cliente
   */
  async update(id: string, data: UpdateCustomerDto) {
    const user = await this.findOne(id); // Garante que existe e é cliente

    const { name, email, phone, address } = data;

    // Update basic info
    await this.prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        customerProfile: {
          update: {
            phone
          },
        },
      }
    });

    // Update or Create Address
    if (address) {
      // Check if user has an address
      const output = await this.prisma.address.findFirst({
        where: { userId: id }
      });

      if (output) {
        await this.prisma.address.update({
          where: { id: output.id },
          data: address
        });
      } else {
        await this.prisma.address.create({
          data: {
            userId: id,
            ...address,
            country: 'BR',
            isDefault: true,
            label: 'Principal'
          }
        });
      }
    }

    return await this.findOne(id);
  }

  /**
   * Soft delete (isActive = false)
   */
  async remove(id: string) {
    await this.findOne(id); // Garante existência

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Cliente removido com sucesso.' };
  }
}
