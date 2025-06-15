import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entity/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './infrastructure/validator/config.schema.validator';
import { Category } from './domain/entity/category.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { RefreshToken } from './domain/entity/refresh_token.entity';
import { AppController } from './app.controller';
import { AppProviders } from './app.provider';
import { S3Module } from './infrastructure/aws/s3/s3.module';
import { Artwork } from './domain/entity/artwork.entity';
import { Cart } from './domain/entity/cart.entity';
import { CartItem } from './domain/entity/cart_item.entity';
import { OrderItem } from './domain/entity/order_item.entity';
import { Order } from './domain/entity/order.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          synchronize: true,
          poolSize: 10,
          ...(configService.get('DB_SSL') === 'false' && {
            ssl: {
              rejectUnauthorized: false,
            },
          }),
          // extra: {
          //   max: 1,
          //   min: 1,
          //   idleTimeoutMillis: 30000,
          // },
          // logging: true,
          entities: [
            User,
            Category,
            RefreshToken,
            Artwork,
            Cart,
            CartItem,
            Order,
            OrderItem,
          ],
        };
      },
    }),
    TypeOrmModule.forFeature([
      User,
      Category,
      RefreshToken,
      Artwork,
      Cart,
      CartItem,
      Order,
      OrderItem,
    ]),
    CacheModule.register({
      isGlobal: true,
      ttl: 1800000, // 30 minutes in milliseconds
      max: 100,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRATION_TIME') },
      }),
    }),
    ScheduleModule.forRoot(),
    S3Module,
  ],
  controllers: AppController,
  providers: AppProviders,
})
export class AppModule {}
