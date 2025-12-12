import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

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
                'script-src': [
                  "'self'",
                  'https://static.cloudflareinsights.com',
                  "'sha256-6Z59t59rp52o8zfsvvsotNda8VkKS1YOhoOYeTzwods='",
                ],

                // imagens do próprio site + data: (base64) + https
                'img-src': ["'self'", 'data:', 'https:'],

                // XHR/fetch/websocket (API no mesmo domínio)
                'connect-src': ["'self'", 'https://static.cloudflareinsights.com'],
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

    /**
     * ✅ SPA fallback (Vite + React Router)
     * Se for GET, não for /api e não for arquivo (tem ponto),
     * devolve o dist/public/index.html.
     */
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next();
      if (req.path.startsWith('/api')) return next();
      if (req.path.includes('.')) return next(); // assets / arquivos
      return res.sendFile(join(process.cwd(), 'dist', 'public', 'index.html'));
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`🚀 Rodando na porta ${port}`);
  } catch (err) {
    console.error('Error during bootstrap:', err);
    process.exit(1);
  }
}

bootstrap();
