import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const isProd = process.env.NODE_ENV === 'production';

    app.use(
      helmet({
        contentSecurityPolicy: isProd
          ? {
              useDefaults: true,
              directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),

                // scripts do próprio site + Cloudflare Insights (se usar)
                "script-src": [
  "'self'",
  "https://static.cloudflareinsights.com",
  "'sha256-6Z59t59rp52o8zfsvvsotNda8VkKS1YOhoOYeTzwods='",
],


                // se você carregar CSS externo (Google Fonts etc), libera aqui
                // "style-src": ["'self'", "https://fonts.googleapis.com"],
                // "font-src": ["'self'", "https://fonts.gstatic.com"],

                // imagens do próprio site + data: (base64) se precisar
                "img-src": ["'self'", "data:", "https:"],

                // XHR/fetch/websocket (API no mesmo domínio)
                "connect-src": ["'self'", "https://static.cloudflareinsights.com"],

                // se você usa iframes (pagamento, etc), ajusta aqui
                // "frame-src": ["'self'"],
              },
            }
          : false,
      }),
    );

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    if (isProd) {
      const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : true;
      app.enableCors({
        origin: allowedOrigins,
        credentials: true,
      });
    } else {
      app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
      });
    }

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`🚀 Rodando na porta ${port}`);
  } catch (err) {
    console.error('Error during bootstrap:', err);
    process.exit(1);
  }
}

bootstrap();
