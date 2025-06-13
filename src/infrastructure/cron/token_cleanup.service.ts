import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RefreshTokenRepository } from '../repository/refresh_token.respository';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name, {
    timestamp: true,
  });

  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredTokens() {
    const now = new Date();

    this.logger.log(
      'method=handleExpiredTokens, Started cleaning up expired refresh tokens...',
    );

    try {
      await this.refreshTokenRepository.deleteExpiredTokens(now);
      this.logger.log(
        'method=handleExpiredTokens, Successfully cleaned up expired refresh tokens',
      );
    } catch (error) {
      this.logger.error(
        'method=handleExpiredTokens, Error cleaning up expired refresh tokens',
        error.stack,
      );
    }
  }
}
