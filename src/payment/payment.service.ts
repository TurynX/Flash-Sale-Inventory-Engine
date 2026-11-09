import { BadRequestException, Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import Stripe from 'stripe';
export interface ChargeResult {
  success: any;
  chargeId: string;
  url: string;
}
@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(private readonly logger: Logger) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2026-10-28.endive',
    });
  }

  async createCheckoutSession(
    userId: string,
    productId: string,
    productName: string,
    productPrice: number,
    quantity: number,
  ): Promise<ChargeResult> {
    try {
      const paymentIntent = await this.stripe.checkout.sessions.create({
        allowed_payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: productName,
              },
              unit_amount: productPrice * 100,
            },
            quantity: quantity,
          },
        ],
        metadata: {
          userId: userId,
          productId,
          quantity: quantity,
        },
        mode: 'payment',
        success_url: 'http://localhost:3000/orders/webhook/checkout',
        cancel_url: 'http://youtube.com',
      });
      this.logger.log('Stripe payment intent created');
      return {
        success: paymentIntent.status,
        chargeId: paymentIntent.id,
        url: paymentIntent.url!,
      };
    } catch (error: any) {
      this.logger.error('Stripe charge error: ' + error.message);
      throw new BadRequestException('Stripe error: ' + error.message);
    }
  }
}
