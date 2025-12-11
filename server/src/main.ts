import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Middleware de segurança
    app.use(helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    }));

    // Validação global
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // CORS - Configuração baseada no ambiente
    if (process.env.NODE_ENV === 'production') {
      // Em produção monolito (tudo no mesmo servidor), CORS pode ser mais permissivo
      // ou restrito ao próprio domínio
      const allowedOrigins = process.env.FRONTEND_URL 
        ? [process.env.FRONTEND_URL]
        : true; // Se não especificado, permite qualquer origem (ajuste conforme necessário)
      
      app.enableCors({
        origin: allowedOrigins,
        credentials: true,
      });
    } else {
      // Em desenvolvimento, permite frontend local
      app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
      });
    }

    const port = process.env.PORT || 3000;
    await app.listen(port);
    
    if (process.env.NODE_ENV === 'production') {
      console.log(`🚀 Aplicação rodando em http://localhost:${port}`);
      console.log(`📦 Frontend servido em: http://localhost:${port}`);
      console.log(`🔌 API disponível em: http://localhost:${port}/api`);
    } else {
      console.log(`🚀 API rodando em http://localhost:${port}`);
    }
  } catch (err) {
    console.error('Error during bootstrap:', err);
    process.exit(1);
  }
}

bootstrap();
