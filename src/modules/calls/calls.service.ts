import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CallSession } from './entities/call-session.entity';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class CallsService {
  constructor(
    @InjectModel(CallSession.name) private callModel: Model<CallSession>,
    private walletService: WalletService,
  ) {}

  async initiateCall(callerId: string, receiverId: string, costPerMinute = 50) {
    // Check wallet balance (minimum 1 minute call cost)
    const wallet = await this.walletService.getBalance(callerId);
    if (wallet.balance < costPerMinute) {
      throw new BadRequestException(
        'Insufficient wallet balance to initiate call',
      );
    }

    // Don't allow calling yourself
    if (callerId === receiverId) {
      throw new BadRequestException('Cannot call yourself');
    }

    // Create call session
    const call = await this.callModel.create({
      callerId: new Types.ObjectId(callerId),
      receiverId: new Types.ObjectId(receiverId),
      status: 'initiated',
      startedAt: new Date(),
      costPerMinute,
    });

    return {
      callId: call._id,
      status: call.status,
      receiverId: call.receiverId,
      costPerMinute: call.costPerMinute,
      message: 'Call initiated successfully',
    };
  }

  async endCall(callId: string, callerId: string) {
    const call = await this.callModel.findById(callId);
    if (!call) throw new NotFoundException('Call session not found');

    // Verify caller owns this call
    if (call.callerId.toString() !== callerId) {
      throw new BadRequestException('Unauthorized to end this call');
    }

    // Check if already ended
    if (call.status === 'ended') {
      return {
        callId: call._id,
        status: call.status,
        duration: call.duration,
        totalCost: call.totalCost,
        message: 'Call already ended',
      };
    }

    // Calculate duration in minutes
    const startTime = call.startedAt?.getTime() || Date.now();
    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const durationMinutes = Math.ceil(durationMs / 60000); // Round up to nearest minute

    // Calculate cost
    const totalCost = durationMinutes * call.costPerMinute;

    // Deduct from wallet
    const reference = `CALL_${call._id}_${Date.now()}`;
    await this.walletService.debitWallet(callerId, totalCost, reference, {
      callId: call._id,
      duration: durationMinutes,
      costPerMinute: call.costPerMinute,
    });

    // Update call session
    call.status = 'ended';
    call.endedAt = new Date();
    call.duration = durationMinutes;
    call.totalCost = totalCost;
    await call.save();

    return {
      callId: call._id,
      status: call.status,
      duration: call.duration,
      totalCost: call.totalCost,
      message: 'Call ended and wallet debited successfully',
    };
  }

  async getCallHistory(userId: string, limit = 20) {
    return this.callModel
      .find({
        $or: [
          { callerId: new Types.ObjectId(userId) },
          { receiverId: new Types.ObjectId(userId) },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-__v');
  }

  async getCallById(callId: string) {
    const call = await this.callModel.findById(callId);
    if (!call) throw new NotFoundException('Call session not found');
    return call;
  }
}
