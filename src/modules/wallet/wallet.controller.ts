import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { FundWalletDto } from './dtos/fund-wallet.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthUser } from 'src/common/decorators/auth-user.decorators';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  async getBalance(@AuthUser() user: any) {
    return this.walletService.getBalance(user.userId);
  }

  @Post('fund')
  async fundWallet(@AuthUser() user: any, @Body() dto: FundWalletDto) {
    return this.walletService.initiateFunding(
      user.userId,
      dto.amount,
      dto.email,
    );
  }

  @Get('transactions')
  async getTransactions(@AuthUser() user: any, @Query('limit') limit?: number) {
    return this.walletService.getTransactions(user.userId, limit || 20);
  }
}
