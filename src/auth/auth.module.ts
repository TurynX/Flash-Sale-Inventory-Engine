import { Module } from '@nestjs/common';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { AuthRepository } from './infrastructure/repository/db.repository';
import { AuthPort } from './domain/ports/auth.port';
import { JwtModule } from '@nestjs/jwt';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'supersecret_fallback'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthRepository,
    { provide: AuthPort, useClass: AuthRepository },
    JwtAuthGuard,
    CreateUserUseCase,
    LoginUserUseCase,
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
