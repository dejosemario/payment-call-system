import { IsNumber, IsPositive, IsEmail } from 'class-validator';

export class FundWalletDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEmail()
  email: string;
}
