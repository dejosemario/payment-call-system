import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { MonnifyWebhookDto } from './dtos/monnify-webhook.dto';
import { MonnifyService } from './services/monnify.service';
import { WalletService } from '../wallet/wallet.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private monnifyService: MonnifyService,
    private walletService: WalletService,
  ) {}

  @Post('monnify/webhook')
  async handleMonnifyWebhook(@Body() dto: MonnifyWebhookDto) {
    // Verify webhook signature
    const isValid = this.monnifyService.verifyWebhookSignature(dto);
    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Only process successful payments
    if (dto.paymentStatus !== 'PAID') {
      return { message: 'Payment not completed', status: dto.paymentStatus };
    }

    // Credit wallet
    const transaction = await this.walletService.creditWallet(
      dto.paymentReference,
      dto.amountPaid,
    );

    return {
      message: 'Webhook processed successfully',
      transaction,
    };
  }
}
