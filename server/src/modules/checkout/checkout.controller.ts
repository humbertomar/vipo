import { Controller, Post, Body } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('api/checkout')
export class CheckoutController {
    constructor(private readonly service: CheckoutService) { }

    @Post()
    async checkout(@Body() data: CreateCheckoutDto) {
        const order = await this.service.processCheckout(data);
        return { data: order };
    }
}
