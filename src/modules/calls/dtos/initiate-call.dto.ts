import { IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class InitiateCallDto {
  @IsString()
  receiverId: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  costPerMinute?: number; // Default 50 NGN per minute
}
