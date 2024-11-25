import { LessThan, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from 'src/domain/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/application/dto/users/create_user.dto';
import { RefreshToken } from 'src/domain/entity/refresh_token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async createRefreshToken(
    refreshToken: Partial<RefreshToken>,
  ): Promise<RefreshToken> {
    return await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create(refreshToken),
    );
  }

  async getRefreshTokenByTokenHash(tokenHash: string) {
    return this.refreshTokenRepository.findOneBy({ tokenHash });
  }

  async getRefreshTokenByUserAndTokenHash(user: User, tokenHash: string) {
    return this.refreshTokenRepository.findOneBy({ tokenHash, user });
  }

  async deleteRefreshTokenByHash(tokenHash: string, userId: string) {
    return this.refreshTokenRepository.delete({
      tokenHash,
      user: { id: userId },
    });
  }

  async deleteExpiredTokens(now: Date): Promise<void> {
    await this.refreshTokenRepository.delete({ expiresAt: LessThan(now) });
  }
}
