import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
    constructor(private prisma: PrismaService) { }

    async findAll(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { order: true }
            }),
            this.prisma.payment.count(),
        ]);

        return {
            data: payments,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: { order: true }
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        return payment;
    }

    async updateStatus(id: string, status: PaymentStatus) {
        const payment = await this.prisma.payment.findUnique({ where: { id } });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        const updated = await this.prisma.payment.update({
            where: { id },
            data: { status }
        });

        return updated;
    }
}
