import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReserveDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Identifier of the product to reserve',
  })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({
    example: 2,
    description: 'Number of units to reserve',
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  quantity!: number;
}

export class OrderDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Identifier of the product with an active reservation',
  })
  @IsString()
  @IsNotEmpty()
  productId!: string;
}
