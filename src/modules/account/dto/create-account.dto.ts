import { IsEnum } from 'class-validator';
import { Currency } from '../entities/account.entity';

export class CreateAccountDto {
  @IsEnum(Currency)
  currency: Currency;
}
