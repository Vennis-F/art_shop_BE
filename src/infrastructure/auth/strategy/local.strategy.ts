import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/domain/service/auth.service';
import { User } from 'src/domain/entity/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger(LocalStrategy.name, { timestamp: true });

  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      this.logger.warn(
        `method=validate, Authentication failed for email=${email}`,
      );
      throw new UnauthorizedException();
    }

    this.logger.log(
      `method=validate, Authentication succeeded for email=${email}, userId=${user.id}`,
    );
    return user;
  }
}
