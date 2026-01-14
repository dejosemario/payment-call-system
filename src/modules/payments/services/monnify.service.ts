import { Injectable } from '@nestjs/common';

@Injectable()
export class MonnifyService {
  // Mock: Initialize payment
  initializeTransaction(amount: number, customerEmail: string) {
    const reference = `MNFY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      requestSuccessful: true,
      responseBody: {
        transactionReference: reference,
        paymentReference: reference,
        checkoutUrl: `https://monnify.com/pay/${reference}`,
        accountNumber: '7012345678',
        accountName: 'Payment Call System',
        bankName: 'Wema Bank',
        amount,
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    };
  }

  // Verify webhook signature (mocked)
  verifyWebhookSignature(payload: any): boolean {
    // In production: HMAC SHA512 verification
    // const hash = crypto.createHmac('sha512', MONNIFY_SECRET).update(JSON.stringify(payload)).digest('hex');
    return true; // Mock always valid
  }
}
