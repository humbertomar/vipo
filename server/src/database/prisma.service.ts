import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Serviço Prisma para gerenciar conexão com banco de dados
 * Implementa OnModuleInit e OnModuleDestroy para gerenciar ciclo de vida
 */

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Banco de dados conectado');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

