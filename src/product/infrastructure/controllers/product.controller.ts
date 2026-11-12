import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateProductUseCase } from 'src/product/application/use-cases/create-product.use-case';
import { CreateProductDto } from '../dtos/product-dto';
import { FindProductByIdUseCase } from 'src/product/application/use-cases/find-product-by-id.use-case';
import { FindAllProductsUseCase } from 'src/product/application/use-cases/find-all-product.use-case';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
@Controller('product')
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly findAllProductsUseCase: FindAllProductsUseCase,
    private readonly findByIdUseCase: FindProductByIdUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createProduct(@Req() req: Request, @Body() body: CreateProductDto) {
    const role = req['user'].role;

    if (role !== 'admin') {
      throw new UnauthorizedException('You are not authorized');
    }

    const result = await this.createProductUseCase.execute(body);

    return { message: 'Product created successfully', data: result };
  }
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const result = await this.findAllProductsUseCase.execute();
    return { message: 'Products retrieved successfully', data: result };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.findByIdUseCase.execute(id);
    return { message: 'Product retrieved successfully', data: result };
  }
}
