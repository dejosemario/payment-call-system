import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { MonnifyService } from './services/monnify.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [WalletModule],
  controllers: [PaymentsController],
  providers: [MonnifyService],
  exports: [MonnifyService],
})
export class PaymentsModule {}
