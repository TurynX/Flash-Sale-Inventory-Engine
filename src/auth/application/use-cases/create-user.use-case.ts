import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthPort } from 'src/auth/domain/ports/auth.port';
import { CreateUserDto } from 'src/auth/infrastructure/dtos/auth-dto';
import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly authPort: AuthPort) {}

  async execute(body: CreateUserDto) {
    const userAlreadyExists = await this.authPort.findByEmail(body.email);
    console.log(userAlreadyExists, '2');
    if (userAlreadyExists) throw new BadRequestException('User already exists');

    const hashedPassword = await argon2.hash(body.password);

    const result = await this.authPort.create(body.email, hashedPassword);

    if (!result) throw new InternalServerErrorException('User not created');

    return result;
  }
}
