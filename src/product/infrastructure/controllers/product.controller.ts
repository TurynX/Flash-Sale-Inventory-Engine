import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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

    return { data: result };
  }
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const result = await this.findAllProductsUseCase.execute();
    return { data: result };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    const result = await this.findByIdUseCase.execute(id);
    return { data: result };
  }
}
