import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transactions.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}

  async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!wallet) {
      wallet = await this.walletModel.create({ userId, balance: 0 });
    }
    return wallet;
  }

  async getBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return { balance: wallet.balance, currency: wallet.currency };
  }

  async initiateFunding(userId: string, amount: number, email: string) {
    const wallet = await this.getOrCreateWallet(userId);
    const reference = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check for duplicate
    const existing = await this.transactionModel.findOne({ reference });
    if (existing) return existing;

    // Create pending transaction
    const transaction = await this.transactionModel.create({
      walletId: wallet._id,
      userId: new Types.ObjectId(userId),
      type: 'credit',
      amount,
      reference,
      status: 'pending',
      metadata: { email },
    });

    // Mock Monnify response
    return {
      transactionReference: reference,
      paymentReference: reference,
      accountNumber: '7012345678',
      bankName: 'Wema Bank',
      accountName: 'Payment Call System',
      amount,
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      checkoutUrl: `https://monnify.com/pay/${reference}`,
    };
  }

  async creditWallet(reference: string, amountPaid: number) {
    const transaction = await this.transactionModel.findOne({ reference });
    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.status === 'success') return transaction; // Already processed

    const wallet = await this.walletModel.findById(transaction.walletId);
    if (!wallet) throw new NotFoundException('Wallet not found');

    // Update wallet balance
    wallet.balance += amountPaid;
    await wallet.save();

    // Update transaction
    transaction.status = 'success';
    transaction.metadata = { ...transaction.metadata, paidOn: new Date() };
    await transaction.save();

    return transaction;
  }

  async debitWallet(
    userId: string,
    amount: number,
    reference: string,
    metadata?: any,
  ) {
    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Deduct balance
    wallet.balance -= amount;
    await wallet.save();

    // Record transaction
    const transaction = await this.transactionModel.create({
      walletId: wallet._id,
      userId: new Types.ObjectId(userId),
      type: 'debit',
      amount,
      reference,
      status: 'success',
      metadata,
    });

    return transaction;
  }

  async getTransactions(userId: string, limit = 20) {
    return this.transactionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}
