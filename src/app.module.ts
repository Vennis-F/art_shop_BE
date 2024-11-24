import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './application/controller/v1/user.controller';
import { UserService } from './domain/service/user.services';
import { UserRepository } from './infrastructure/repository/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entity/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './infrastructure/validator/config.schema.validator';
import { Category } from './domain/entity/category.entity';
import { CategoryService } from './domain/service/category.service';
import { CategoryRepository } from './infrastructure/repository/category.repository';
import { CategoryController } from './application/controller/v1/category.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthController } from './application/controller/v1/auth.controller';
import { AuthService } from './domain/service/auth.service';
import { LocalStrategy } from './infrastructure/auth/strategy/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './infrastructure/auth/strategy/jwt.strategy';
import { ScheduleModule } from '@nestjs/schedule';
import { TokenCleanupService } from './infrastructure/cron/token_cleanup.service';
import { RefreshTokenRepository } from './infrastructure/repository/refresh_token.respository';
import { RefreshToken } from './domain/entity/refresh_token.entity';
import { CookieHelper } from './infrastructure/helper/cookie.helper';

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
  controllers: [
    AppController,
    UserController,
    CategoryController,
    AuthController,
  ],
  providers: [
    AppService,
    UserService,
    UserRepository,
    CategoryService,
    CategoryRepository,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    TokenCleanupService,
    RefreshTokenRepository,
    CookieHelper,
  ],
})
export class AppModule {}
