import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
    @IsNotEmpty()
    @IsString()
    cep!: string;

    @IsNotEmpty()
    @IsString()
    street!: string;

    @IsNotEmpty()
    @IsString()
    number!: string;

    @IsOptional()
    @IsString()
    complement?: string;

    @IsNotEmpty()
    @IsString()
    neighborhood!: string;

    @IsNotEmpty()
    @IsString()
    city!: string;

    @IsNotEmpty()
    @IsString()
    state!: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    label?: string;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
