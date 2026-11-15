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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Products')
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
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Create a product (admin only, use the ADMIN_EMAIL environment variable)',
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    schema: {
      example: {
        message: 'Product created successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Wireless headphones',
          price: 79.99,
          totalStock: 25,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid product data' })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid token, or user is not an admin',
  })
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
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    schema: {
      example: {
        message: 'Products retrieved successfully',
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Wireless headphones',
            price: 79.99,
            totalStock: 25,
          },
        ],
      },
    },
  })
  async findAll() {
    const result = await this.findAllProductsUseCase.execute();
    return { message: 'Products retrieved successfully', data: result };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    schema: {
      example: {
        message: 'Product retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Wireless headphones',
          price: 79.99,
          totalStock: 25,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'ID is not a valid UUID' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.findByIdUseCase.execute(id);
    return { message: 'Product retrieved successfully', data: result };
  }
}
