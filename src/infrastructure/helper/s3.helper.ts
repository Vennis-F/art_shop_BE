import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class S3Helper {
  constructor(private readonly configService: ConfigService) {}

  getFullImageUrl(key: string): string {
    return `https://${this.configService.get('AWS_CLOUD_FRONT_DOMAIN')}/${key}`;
  }
}
