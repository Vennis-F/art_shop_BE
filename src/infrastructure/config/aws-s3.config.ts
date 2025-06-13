import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export const createS3Client = (configService: ConfigService) => {
  const region = configService.get<string>('AWS_REGION');
  const accessKeyId = configService.get<string>('AWS_ACCESS_KEY_ID');
  const secretAccessKey = configService.get<string>('AWS_SECRET_ACCESS_KEY');

  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Missing AWS configuration (region, accessKeyId, or secretAccessKey)',
    );
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};
