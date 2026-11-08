import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  UseGuards,
  Req,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { OrderDto } from '../dtos/order-dto';
import { ReserveUseCase } from 'src/order/application/use-cases/reserve.use-case';
import { CheckoutUseCase } from 'src/order/application/use-cases/checkout-order.use-case';
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(
    private readonly reserveUseCase: ReserveUseCase,
    private readonly checkoutUseCase: CheckoutUseCase,
  ) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async reserve(@Req() req: Request, @Body() body: OrderDto) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('userId not provided');

    const result = await this.reserveUseCase.execute(body, userId);
    if (result !== true)
      throw new InternalServerErrorException('Error to create order');

    return {
      message: 'Product reserved',
      data: {
        productId: body.productId,
        quantity: body.quantity,
      },
    };
  }

  @Post('checkout')
  @HttpCode(HttpStatus.ACCEPTED)
  async checkout(@Req() req: Request, @Body() body: OrderDto) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('userId not provided');
    const result = await this.checkoutUseCase.execute(
      userId,
      body.productId,
      body.quantity,
    );
    if (!result) throw new InternalServerErrorException('Error to checkout');
    return {
      message: 'Checkout done',
      data: {
        result,
      },
    };
  }
}
