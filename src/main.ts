import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { CustomResponseInterceptor } from './application/interceptor/response/custom_response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Bắt buộc để @Transform hoạt động
      whitelist: true, // Tùy chọn: loại bỏ field không nằm trong DTO
      forbidNonWhitelisted: false, // Tùy: cảnh báo khi có field thừa
    }),
  );
  app.useGlobalInterceptors(new CustomResponseInterceptor());
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on port: ${process.env.PORT}`);
}
bootstrap();
