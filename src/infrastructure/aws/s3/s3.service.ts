import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  constructor(
    private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(
    bucket: string,
    key: string,
    body: Buffer | string,
    contentType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.s3Client.send(command);

    return this.getFileUrl(key);
  }

  async downloadFile(bucket: string, key: string): Promise<Readable> {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await this.s3Client.send(command);
    return response.Body as Readable;
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    await this.s3Client.send(command);
  }

  getFileUrl(key: string) {
    return `https://${this.configService.get('AWS_CLOUD_FRONT_DOMAIN')}/${key}`;
  }
}
