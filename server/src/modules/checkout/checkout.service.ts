import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

interface CheckoutItem {
    productId: string;
    variantId: string;
    quantity: number;
    priceInCents: number;
}

@Injectable()
export class CheckoutService {
    constructor(
        @Inject(PrismaService) private prisma: PrismaService,
        @Inject(OrdersService) private ordersService: OrdersService
    ) { }

    async processCheckout(data: CreateCheckoutDto) {
        let itemsToProcess: CheckoutItem[] = [];

        // 1. Determine items source (Direct or Cart)
        if (data.items && data.items.length > 0) {
            itemsToProcess = data.items;
        } else if (data.cartUserId) {
            // Fetch cart items
            const cart = await this.prisma.cart.findFirst({
                where: { userId: data.cartUserId },
                include: {
                    items: {
                        include: { variant: true }
                    }
                }
            });

            if (!cart || cart.items.length === 0) {
                throw new BadRequestException('Carrinho vazio ou não encontrado.');
            }

            // Map cart items to order items structure, fetching current price from variant/product if needed
            for (const item of cart.items) {
                const variant = await this.prisma.productVariant.findUnique({
                    where: { id: item.variantId },
                    include: { product: true }
                });

                if (!variant) continue;

                // Calculate price using product base price + variant adjustment
                const priceInCents = variant.product.priceInCents + (variant.priceAdjustment || 0);

                itemsToProcess.push({
                    productId: variant.productId,
                    variantId: variant.id,
                    quantity: item.quantity,
                    priceInCents: priceInCents
                });
            }
        } else {
            throw new BadRequestException('Nenhum item fornecido para checkout.');
        }

        if (itemsToProcess.length === 0) {
            throw new BadRequestException('Não foi possível processar os itens do pedido.');
        }

        // 2. Prepare Order Data
        const orderData = {
            userId: data.userId || data.cartUserId, // Fallback to cart user
            type: 'ONLINE',
            status: 'PENDING',
            paymentMethod: data.paymentMethod,
            items: itemsToProcess,
            shippingAddressId: data.shippingAddressId,
            billingAddressId: data.billingAddressId,
            notes: data.notes
        };

        // 3. Create Order using OrdersService
        const order = await this.ordersService.create(orderData);

        // 4. Clear Cart if used
        if (data.cartUserId && (!data.items || data.items.length === 0)) {
            await this.prisma.cartItem.deleteMany({
                where: { cart: { userId: data.cartUserId } }
            });
        }

        return order;
    }
}
