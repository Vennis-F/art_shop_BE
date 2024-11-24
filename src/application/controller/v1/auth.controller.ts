import {
  Controller,
  HttpCode,
  Logger,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { LoginTimeoutException } from 'src/application/exception/login_timeout.exception';
import { JwtAuthGuard } from 'src/application/guard/jwt_auth.guard';
import { LocalAuthGuard } from 'src/application/guard/local_auth.guard';
import { RefreshTokenGuard } from 'src/application/guard/refresh_token_auth.guard';
import { AuthService } from 'src/domain/service/auth.service';
import { CookieHelper } from 'src/infrastructure/helper/cookie.helper';

@Controller('v1/auth')
export class AuthController {
  private logger = new Logger(AuthController.name, { timestamp: true });

  constructor(
    private readonly authService: AuthService,
    private readonly cookieHelper: CookieHelper,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any, @Res() res: Response) {
    const { access_token, refresh_token } =
      await this.authService.generateTokens(req.user);

    this.cookieHelper.setAuthCookies(res, access_token, refresh_token);

    return res.json({ access_token, refresh_token });
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refreshToken(@Request() req: any, @Res() res: Response) {
    const { access_token, refresh_token } =
      await this.authService.refreshAccessToken(req.refreshToken);

    this.cookieHelper.setAuthCookies(res, access_token, refresh_token);

    return res.json({ access_token, refresh_token });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(@Request() req: any, @Res() res: Response) {
    const refreshTokenFromCookie = req.cookies['refresh_token'];

    if (!refreshTokenFromCookie) {
      this.logger.warn(
        `method=refreshToken, Refresh token not found in cookies`,
      );
      throw new LoginTimeoutException();
    }

    await this.authService.logout(req.user, refreshTokenFromCookie);

    this.cookieHelper.clearAuthCookies(res);

    return res.json({ message: 'Logout Successfully' });
  }
}
