import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { CreateUserUseCase } from 'src/auth/application/use-cases/create-user.use-case';
import { CreateUserDto } from '../dtos/auth-dto';
import { LoginUserUseCase } from 'src/auth/application/use-cases/login-user.use-case';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Users')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        message: 'User created successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'joao.silva@gmail.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or user already exists',
  })
  @ApiResponse({ status: 500, description: 'User could not be created' })
  async create(@Body() body: CreateUserDto) {
    const result = await this.createUserUseCase.execute(body);

    if (!result) throw new InternalServerErrorException('User not created');

    return { message: 'User created successfully', data: result };
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    schema: {
      example: {
        message: 'User logged in successfully',
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 500, description: 'User could not be logged in' })
  async login(@Body() body: CreateUserDto) {
    const result = await this.loginUserUseCase.execute(body);

    if (!result) throw new InternalServerErrorException('User not logged in');

    return {
      message: 'User logged in successfully',
      data: { token: result },
    };
  }
}
