import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Types } from 'mongoose';

@Schema()
export class CallSession extends BaseEntity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  callerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiverId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['initiated', 'ringing', 'active', 'ended', 'failed'],
    default: 'initiated',
  })
  status: 'initiated' | 'ringing' | 'active' | 'ended' | 'failed';

  @Prop()
  startedAt?: Date;

  @Prop()
  endedAt?: Date;

  @Prop({ type: Number, default: 0 })
  duration: number; // in minutes

  @Prop({ type: Number, default: 50 })
  costPerMinute: number;

  @Prop({ type: Number, default: 0 })
  totalCost: number;
}

export const CallSessionSchema = SchemaFactory.createForClass(CallSession);
