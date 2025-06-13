import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from 'src/infrastructure/repository/user.repository';
import { User } from '../entity/user.entity';
import { HashingHelper } from 'src/infrastructure/helper/hashing.helper';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../types/jwt-payload.type';
import { CryptoHelper } from 'src/infrastructure/helper/crypto.helper';
import { DateHelper } from 'src/infrastructure/helper/date.helper';
import { RefreshTokenRepository } from 'src/infrastructure/repository/refresh_token.respository';
import { TokenResponseDto } from 'src/application/dto/auth/token_response.dto';
import { RefreshToken } from '../entity/refresh_token.entity';
import { LoginTimeoutException } from 'src/application/exception/login_timeout.exception';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name, { timestamp: true });

  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.getUserByEmail(email);

    if (user && (await HashingHelper.compareData(password, user.password))) {
      this.logger.log(
        `method=validateUser, validate successed for email ${user.email} and userId ${user.id}`,
      );
      return user;
    }

    this.logger.warn(`method=validateUser, validate failed for email=${email}`);
    return null;
  }

  async validateUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.getUserByEmail(email);
  }

  async generateAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = { email: user.email, role: user.role };

    this.logger.log(
      `method=generateAccessToken, generated access token for userId=${user.id}, email=${user.email}`,
    );
    return this.jwtService.sign(payload);
  }

  async generateRefreshToken(user: User): Promise<string> {
    const refreshToken = CryptoHelper.generateRandomString(64);
    const tokenHash = CryptoHelper.hashData(refreshToken);
    const expiresAt = DateHelper.addDays(
      this.configService.get('REFRESH_TOKEN_EXPIRATION_DAYS') as number,
    );

    this.logger.log(
      `method=generateRefreshTokenr, generated refresh token for userId=${user.id}, email=${user.email}`,
    );

    await this.refreshTokenRepository.createRefreshToken({
      user,
      tokenHash,
      expiresAt,
    });

    return refreshToken;
  }

  async generateTokens(user: User): Promise<TokenResponseDto> {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async validateRefreshToken(
    refreshToken: string,
  ): Promise<RefreshToken | null> {
    const tokenHash = CryptoHelper.hashData(refreshToken);
    const savedToken =
      await this.refreshTokenRepository.getRefreshTokenByTokenHash(tokenHash);

    if (!savedToken) {
      this.logger.warn(`method=validateRefreshToken, invalid or refresh token`);
      return null;
    }

    const isExpired = new Date() < savedToken.expiresAt;

    if (!isExpired) {
      this.logger.warn(
        `method=validateRefreshToken, Refresh token has expired`,
      );
      return null;
    }

    return savedToken;
  }

  async refreshAccessToken(
    refreshToken: RefreshToken,
  ): Promise<{ access_token: string; refresh_token: string }> {
    if (!refreshToken) {
      this.logger.warn(
        `method=refreshAccessToken, Invalid or expired refresh token`,
      );
      throw new LoginTimeoutException();
    }

    await this.refreshTokenRepository.deleteRefreshTokenByHash(
      refreshToken.tokenHash,
      refreshToken.user.id,
    );

    const newAccessToken = await this.generateAccessToken(refreshToken.user);
    const newRefreshToken = await this.generateRefreshToken(refreshToken.user);

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(user: User, refreshToken: string): Promise<void> {
    const tokenHash = CryptoHelper.hashData(refreshToken);
    const result = await this.refreshTokenRepository.deleteRefreshTokenByHash(
      tokenHash,
      user.id,
    );

    if (result) {
      this.logger.log(
        `method=logout, successfully removed refresh token for userId=${user.id}`,
      );
    } else {
      this.logger.warn(
        `method=logout, failed to remove refresh token for userId=${user.id}`,
      );
    }
  }
}
