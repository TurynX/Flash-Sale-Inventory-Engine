import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthPort } from 'src/auth/domain/ports/auth.port';
import { CreateUserDto } from 'src/auth/infrastructure/dtos/auth-dto';
import argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly authPort: AuthPort,
    private readonly jwtService: JwtService,
  ) {}

  async execute(body: CreateUserDto) {
    const exist = await this.authPort.findByEmail(body.email);
    if (!exist) throw new UnauthorizedException('Invalid credentials');
    console.log(body.password, exist.hashedPassword);
    const isValidPassword = await argon2.verify(
      exist.hashedPassword,
      body.password,
    );

    if (!isValidPassword)
      throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: exist.id,
      email: exist.email,
    };

    const token = await this.jwtService.signAsync(payload);

    return token;
  }
}
