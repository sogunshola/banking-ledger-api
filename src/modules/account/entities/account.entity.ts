import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BasicEntity } from '../../../shared/entities/basic-entity';
import { Types } from 'mongoose';
import { User } from '../../user/entities/user.entity';

export enum Currency {
  NGN = 'NGN',
  USD = 'USD',
}

@Schema()
export class Account extends BasicEntity {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId;

  @Prop({ required: true, enum: Currency })
  currency: Currency;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ required: true, unique: true })
  accountNumber: string;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
