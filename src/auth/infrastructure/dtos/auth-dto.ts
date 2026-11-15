import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'joao.silva@email.com',
    description: 'User email',
    format: 'email',
  })
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @ApiProperty({
    example: 'strongpassword123',
    description: 'User password',
    minLength: 6,
    maxLength: 20,
    writeOnly: true,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, {
    message: 'Password must be at least 6 characters long',
  })
  @MaxLength(20, {
    message: 'Password must be at most 20 characters long',
  })
  password!: string;
}
