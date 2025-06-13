import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CookieHelper {
  constructor(private readonly configService: ConfigService) {}

  setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: true,
      maxAge: 15 * 60 * 1000, // Cookie after 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie after 7 days
    });
  }

  // Clear cookies for access token and refresh token
  clearAuthCookies(res: Response) {
    res.clearCookie('access_token', { httpOnly: true });
    res.clearCookie('refresh_token', { httpOnly: true });
  }
}
