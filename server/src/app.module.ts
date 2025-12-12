import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
// import { ShippingModule } from './modules/shipping/shipping.module';
// import { CouponsModule } from './modules/coupons/coupons.module';
import { HealthModule } from './modules/health/health.module';
import { UploadModule } from './modules/upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

/**
 * Módulo raiz da aplicação
 * Importa todos os módulos de funcionalidades e configura a aplicação
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CollectionsModule,
    CartModule,
    OrdersModule,
    AddressesModule,
    PaymentsModule,
    CheckoutModule,
    // ShippingModule,
    // CouponsModule,
    HealthModule,
    UploadModule,
    // Servir arquivos de upload
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    // Servir frontend buildado (apenas em produção)
    ...(process.env.NODE_ENV === 'production' 
      ? [
          ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'dist', 'public'),
            exclude: (path) => {
              // Exclui rotas da API e uploads
              return path.startsWith('/api') || path.startsWith('/uploads');
            },
            serveStaticOptions: {
              index: false,
            },
          }),
        ]
      : []
    ),
  ],
})
export class AppModule { }
