import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

/**
 * DTO para registro de usuário
 */
export class SignUpDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;
}

/**
 * DTO para login
 */
export class SignInDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

/**
 * DTO para resposta de autenticação
 */
export class AuthResponseDto {
  accessToken!: string;
  user!: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}

