import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { S3Service } from '../../../infrastructure/aws/s3/s3.service';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FileController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const bucketName = this.configService.get('S3_BUCKET_NAME');
    const key = `uploads/${file.originalname}`;
    const url = await this.s3Service.uploadFile(
      bucketName,
      key,
      file.buffer,
      file.mimetype,
    );
    return { url };
  }
}
