import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { PasswordDecryption } from './infrastructure/common/password.decryption';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly passwordDecryption: PasswordDecryption,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('decrypt')
  decryptPassword(): string[] {
    const dbUser = this.configService.get<string>('DB_USERNAME') || '';
    const dbPassword = this.configService.get<string>('DB_PASSWORD') || '';
    return [
      this.passwordDecryption.getDecryptedEnvironmentPassword(dbUser),
      this.passwordDecryption.getDecryptedEnvironmentPassword(dbPassword),
    ];
  }
}
