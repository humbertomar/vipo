import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class CheckoutItemDto {
    @IsNotEmpty()
    @IsString()
    productId!: string;

    @IsNotEmpty()
    @IsString()
    variantId!: string;

    @IsNotEmpty()
    @IsNumber()
    quantity!: number;

    @IsNotEmpty()
    @IsNumber()
    priceInCents!: number;
}

export class CreateCheckoutDto {
    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    cartUserId?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CheckoutItemDto)
    items?: CheckoutItemDto[];

    @IsNotEmpty()
    @IsEnum(PaymentMethod)
    paymentMethod!: PaymentMethod;

    @IsOptional()
    @IsString()
    shippingAddressId?: string;

    @IsOptional()
    @IsString()
    billingAddressId?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
