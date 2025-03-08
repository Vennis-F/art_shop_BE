import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { createS3Client } from 'src/infrastructure/config/aws-s3.config';
import { S3Service } from './s3.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: S3Client,
      useFactory: (configService: ConfigService) =>
        createS3Client(configService),
      inject: [ConfigService],
    },
    S3Service,
  ],
  exports: [S3Service],
})
export class S3Module {}
