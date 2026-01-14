import { IsString, IsNumber, IsOptional } from 'class-validator';

export class MonnifyWebhookDto {
  @IsString()
  transactionReference: string;

  @IsString()
  paymentReference: string;

  @IsNumber()
  amountPaid: number;

  @IsString()
  paymentStatus: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsOptional()
  paidOn?: string;
}
