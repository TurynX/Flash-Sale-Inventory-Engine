import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { CreateUserUseCase } from 'src/auth/application/use-cases/create-user.use-case';
import { CreateUserDto } from '../dtos/auth-dto';
import { LoginUserUseCase } from 'src/auth/application/use-cases/login-user.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateUserDto) {
    const result = await this.createUserUseCase.execute(body);
    console.log(result);

    if (!result) throw new InternalServerErrorException('User not created');

    return { message: 'User created successfully', data: result };
  }

  @Post('login')
  async login(@Body() body: CreateUserDto) {
    const result = await this.loginUserUseCase.execute(body);

    if (!result) throw new InternalServerErrorException('User not logged in');

    return {
      message: 'User logged in successfully',
      data: { token: result },
    };
  }
}
