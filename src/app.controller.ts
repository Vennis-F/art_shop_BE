import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PasswordDecryption } from './infrastructure/common/password.decryption';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly passwordDecryption: PasswordDecryption,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('decrypt')
  decryptPassword(): string[] {
    const dbUser = process.env.DB_USERNAME || '';
    const dbPassword = process.env.DB_PASSWORD || '';
    return [
      this.passwordDecryption.getDecryptedEnvironmentPassword(dbUser),
      this.passwordDecryption.getDecryptedEnvironmentPassword(dbPassword),
    ];
  }
}
