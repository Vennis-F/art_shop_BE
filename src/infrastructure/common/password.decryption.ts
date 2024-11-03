// infrastructure/password-decryption.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PasswordDecryption {
  private logger = new Logger('PasswordDecryption', { timestamp: true });

  constructor(private configService: ConfigService) {}

  getDecryptedEnvironmentPassword(decryptedPassword: string): string {
    this.logger.log(`Decrypted password: ${decryptedPassword}`);

    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(this.configService.get<string>('KEY') || '', 'hex');
    const iv = Buffer.from(this.configService.get<string>('IV') || '', 'hex');
    const encryptedText = Buffer.from(decryptedPassword, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
