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
          // extra: {
          //   max: 1,
          //   min: 1,
          //   idleTimeoutMillis: 30000,
          // },
          // logging: true,
          entities: [User, Category, RefreshToken],
        };
      },
    }),
    TypeOrmModule.forFeature([User, Category, RefreshToken]),
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
  ],
  controllers: AppController,
  providers: AppProviders,
})
export class AppModule {}
