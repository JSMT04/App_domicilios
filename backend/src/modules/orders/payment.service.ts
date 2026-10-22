import { Injectable, Logger } from '@nestjs/common';

export interface PaymentRequest {
  amount: number;
  currency?: string;
  method: string;
  orderId: string;
}

export interface PaymentResult {
  success: boolean;
  ref: string;
  message: string;
  processedAt: string;
}

/**
 * Mock payment gateway — simulates Stripe/PayU/MercadoPago.
 * In production, replace with real gateway SDK calls.
 *
 * Failure simulation: if amount ends in 999, the payment fails (for testing).
 */
@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Simulate network latency (50–200ms)
    await this.simulateDelay(50 + Math.random() * 150);

    // Simulate occasional failure for testing (amount divisible by 999)
    const shouldFail = Math.round(request.amount) % 999 === 0;

    const ref = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    if (shouldFail) {
      this.logger.warn(`[MOCK] Payment FAILED for order ${request.orderId}, amount: ${request.amount}`);
      return {
        success: false,
        ref,
        message: 'Pago rechazado por el procesador (simulación)',
        processedAt: new Date().toISOString(),
      };
    }

    this.logger.log(`[MOCK] Payment SUCCESS for order ${request.orderId}, amount: ${request.amount}, ref: ${ref}`);
    return {
      success: true,
      ref,
      message: 'Pago procesado exitosamente',
      processedAt: new Date().toISOString(),
    };
  }

  async refundPayment(paymentRef: string): Promise<PaymentResult> {
    await this.simulateDelay(50 + Math.random() * 100);
    const ref = `REF-${paymentRef}`;
    this.logger.log(`[MOCK] Refund issued for ref: ${paymentRef}`);
    return {
      success: true,
      ref,
      message: 'Reembolso procesado',
      processedAt: new Date().toISOString(),
    };
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
