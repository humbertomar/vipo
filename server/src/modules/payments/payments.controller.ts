import { Controller, Get, Param, Put, Body, Query, Post, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentStatus } from '@prisma/client';

@Controller('api/payments')
export class PaymentsController {
    private readonly logger = new Logger(PaymentsController.name);

    constructor(private readonly service: PaymentsService) { }

    @Get()
    async findAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
    ) {
        return this.service.findAll(parseInt(page), parseInt(limit));
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const payment = await this.service.findOne(id);
        return { data: payment };
    }

    @Put(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() body: { status: PaymentStatus }
    ) {
        const payment = await this.service.updateStatus(id, body.status);
        return { data: payment };
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    async webhook(@Body() payload: any) {
        this.logger.log('Payment Webhook received:', JSON.stringify(payload));
        return { received: true };
    }
}
