import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CallsController } from './calls.controller';
import { CallsService } from './calls.service';
import { CallSession, CallSessionSchema } from './entities/call-session.entity';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CallSession.name, schema: CallSessionSchema },
    ]),
    WalletModule,
  ],
  controllers: [CallsController],
  providers: [CallsService],
})
export class CallsModule {}
