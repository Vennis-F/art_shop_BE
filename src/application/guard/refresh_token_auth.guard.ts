import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthService } from 'src/domain/service/auth.service';
import { LoginTimeoutException } from '../exception/login_timeout.exception';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  private logger = new Logger(RefreshTokenGuard.name, { timestamp: true });

  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken =
      request.cookies['refresh_token'] || request.body.refresh_token;

    if (!refreshToken) {
      this.logger.warn(
        `method=canActivate, Refresh token not found in cookies or body`,
      );
      throw new LoginTimeoutException();
    }

    const validRefreshToken =
      await this.authService.validateRefreshToken(refreshToken);

    if (!validRefreshToken) {
      this.logger.warn('method=canActivate, Invalid or expired refresh token');
      throw new LoginTimeoutException();
    }

    request.refreshToken = validRefreshToken;
    return true;
  }
}
