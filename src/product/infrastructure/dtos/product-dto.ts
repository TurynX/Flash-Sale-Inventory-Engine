import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'Wireless headphones',
    description: 'Product name',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 79.99,
    description: 'Product price',
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price!: number;

  @ApiProperty({
    example: 25,
    description: 'Total number of units in stock',
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  totalStock!: number;
}
