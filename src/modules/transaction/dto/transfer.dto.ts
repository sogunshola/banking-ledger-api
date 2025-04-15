import {
  IsMongoId,
  IsNumber,
  Min,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class TransferDto {
  @IsMongoId()
  @IsNotEmpty()
  fromAccountId: string;

  @IsMongoId()
  @IsNotEmpty()
  toAccountId: string;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @IsOptional()
  @IsString()
  narration?: string;
}
