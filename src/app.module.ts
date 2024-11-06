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
          logging: true,
          entities: [User],
        };
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserService, UserRepository],
})
export class AppModule {}
