import { ArtworkService } from './domain/service/artwork.service';
import { AuthService } from './domain/service/auth.service';
import { CategoryService } from './domain/service/category.service';
import { UserService } from './domain/service/user.services';
import { JwtStrategy } from './infrastructure/auth/strategy/jwt.strategy';
import { LocalStrategy } from './infrastructure/auth/strategy/local.strategy';
import { TokenCleanupService } from './infrastructure/cron/token_cleanup.service';
import { CookieHelper } from './infrastructure/helper/cookie.helper';
import { ArtworkRepository } from './infrastructure/repository/artwork.respository';
import { CategoryRepository } from './infrastructure/repository/category.repository';
import { RefreshTokenRepository } from './infrastructure/repository/refresh_token.respository';
import { UserRepository } from './infrastructure/repository/user.repository';

export const AppProviders = [
  UserService,
  UserRepository,
  CategoryService,
  CategoryRepository,
  ArtworkService,
  ArtworkRepository,
  AuthService,
  LocalStrategy,
  JwtStrategy,
  TokenCleanupService,
  RefreshTokenRepository,
  CookieHelper,
];
