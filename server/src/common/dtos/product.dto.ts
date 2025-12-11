import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, Min } from 'class-validator';

/**
 * DTO para criação de produto
 */
export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsString()
  collectionId?: string;

  @IsNumber()
  @Min(0)
  priceInCents!: number;

  @IsOptional()
  @IsNumber()
  promotionalPriceInCents?: number;

  @IsString()
  sku!: string;

  @IsNumber()
  @Min(0)
  totalStock!: number;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

/**
 * DTO para atualização de produto
 */
export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  priceInCents?: number;

  @IsOptional()
  @IsNumber()
  totalStock?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

