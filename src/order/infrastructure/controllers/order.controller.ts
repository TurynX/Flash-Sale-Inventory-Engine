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
import { OrderDto, ReserveDto } from '../dtos/order-dto';
import { ReserveUseCase } from 'src/order/application/use-cases/reserve.use-case';
import { CheckoutUseCase } from 'src/order/application/use-cases/checkout-order.use-case';
import { GenerateStripeUrlUseCase } from 'src/order/application/use-cases/generate-stripe-url.use-case';
import Stripe from 'stripe';
import { Logger } from 'nestjs-pino';
import { Public } from 'src/auth/infrastructure/guards/public-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-10-28.endive',
  });
  constructor(
    private readonly reserveUseCase: ReserveUseCase,
    private readonly generateStripeUrlUseCase: GenerateStripeUrlUseCase,
    private readonly checkoutUseCase: CheckoutUseCase,
    private readonly logger: Logger,
  ) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async reserve(@Req() req: Request, @Body() body: ReserveDto) {
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

  @Post('generate-stripe-url')
  @HttpCode(HttpStatus.CREATED)
  async generateUrl(@Req() req: Request, @Body() body: OrderDto) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('userId not provided');
    const result = await this.generateStripeUrlUseCase.execute(
      userId,
      body.productId,
    );
    if (!result)
      throw new InternalServerErrorException('Error to generate Stripe URL');
    return {
      message: 'Stripe URL generated',
      data: {
        result,
      },
    };
  }

  @Public()
  @Post('webhook/checkout')
  @HttpCode(HttpStatus.ACCEPTED)
  async webHook(@Req() req: Request) {
    const signature = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        (req as any).rawBody,
        signature,
        endpointSecret!,
      );
    } catch (error: any) {
      this.logger.error('Stripe webhook error: ' + error.message);
      throw new InternalServerErrorException(
        'Stripe webhook error: ' + error.message,
      );
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const productId = session.metadata?.productId;
      const quantity = parseInt(session.metadata?.quantity || '0');

      const checkoutResult = await this.checkoutUseCase.execute(
        userId!,
        productId!,
        quantity,
      );
      if (!checkoutResult) {
        throw new InternalServerErrorException('Error to checkout order');
      }

      return {
        message: 'Checkout completed',
      };
    }
  }
}
