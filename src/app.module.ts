import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './application/controller/v1/user.controller';
import { UserService } from './domain/service/user.services';
import { UserRepository } from './infrastructure/repository/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entity/user.entity';
import { databaseProviders } from './infrastructure/database/database.providers';
import { DatabaseModule } from './infrastructure/database/database.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        return {
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'root',
          password: 'root',
          database: 'db_app_postgres',
          synchronize: true,
          poolSize: 10,
          // extra: {
          //   max: 1,
          //   min: 1,
          //   idleTimeoutMillis: 30000,
          // },
          logging: true,
          entities: [
            User
        ],
        };
      },
    }),
    TypeOrmModule.forFeature([User])
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserService, UserRepository],
})
export class AppModule {}
