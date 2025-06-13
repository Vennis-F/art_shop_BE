import { UserRole } from '../entity/user.entity';

export interface JwtPayload {
  email: string;
  role: UserRole;
}
