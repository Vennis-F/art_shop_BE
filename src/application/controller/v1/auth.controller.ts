import {
  Controller,
  HttpCode,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Request, Response } from 'express';
import { TokenResponseDto } from 'src/application/dto/auth/token_response.dto';
import { LoginTimeoutException } from 'src/application/exception/login_timeout.exception';
import { JwtAuthGuard } from 'src/application/guard/jwt_auth.guard';
import { LocalAuthGuard } from 'src/application/guard/local_auth.guard';
import { RefreshTokenGuard } from 'src/application/guard/refresh_token_auth.guard';
import { User } from 'src/domain/entity/user.entity';
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
  async login(@Req() req: Request, @Res() res: Response) {
    const { access_token, refresh_token } =
      await this.authService.generateTokens(req.user as User);

    this.cookieHelper.setAuthCookies(res, access_token, refresh_token);

    return res.json({ access_token, refresh_token });
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refreshToken(@Req() req: any, @Res() res: Response) {
    const { access_token, refresh_token } =
      await this.authService.refreshAccessToken(req.refreshToken);

    this.cookieHelper.setAuthCookies(res, access_token, refresh_token);

    return res.json({ access_token, refresh_token });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshTokenFromCookie = req.cookies['refresh_token'];

    if (!refreshTokenFromCookie) {
      this.logger.warn(
        `method=refreshToken, Refresh token not found in cookies`,
      );
      throw new LoginTimeoutException();
    }

    await this.authService.logout(req.user as User, refreshTokenFromCookie);

    this.cookieHelper.clearAuthCookies(res);

    return { message: 'Logout successful' };
  }
}
