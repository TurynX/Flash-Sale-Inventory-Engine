import { UserEntity } from '../entities/auth.entity';

export abstract class AuthPort {
  abstract create(email: string, hashedPassword: string): Promise<UserEntity>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
}
