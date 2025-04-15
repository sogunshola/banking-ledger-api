import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class DepositWithdrawDto {
  @IsMongoId()
  @IsNotEmpty()
  accountId: string;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @IsOptional()
  @IsString()
  narration?: string;
}
