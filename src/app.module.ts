import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PasswordDecryption } from './infrastructure/common/password.decryption';
import { ConfigModule } from '@nestjs/config';
import { configValidationSchema } from './infrastructure/validation/validation.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PasswordDecryption],
})
export class AppModule {}
