// infrastructure/password-decryption.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class PasswordDecryption {
  getDecryptedEnvironmentPassword(decryptedPassword: string): string {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.KEY || '', 'hex');
    const textParts = decryptedPassword.split(':');
    const iv = Buffer.from(textParts.shift() || '', 'hex');
    const encryptedText = Buffer.from(textParts.join(''), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
