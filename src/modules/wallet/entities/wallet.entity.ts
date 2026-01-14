import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Types } from 'mongoose';

@Schema()
export class Wallet extends BaseEntity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  balance: number;

  @Prop({ default: 'NGN' })
  currency: string;

  @Prop({ type: Number, default: 0 })
  version: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
