import { Types } from 'mongoose';
import { BasicEntity } from '../../../shared/entities/basic-entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Account } from '../../account/entities/account.entity';

export enum TransactionType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

@Schema()
export class Transaction extends BasicEntity {
  @Prop({ type: Types.ObjectId, ref: Account.name, required: true })
  account: Types.ObjectId;

  @Prop({ enum: TransactionType, required: true })
  type: TransactionType;

  @Prop({ required: true })
  amount: number;

  @Prop()
  narration: string;

  @Prop({ required: true })
  reference: string;

  @Prop({ type: Types.ObjectId, ref: 'Transaction' })
  linkedTransaction?: Types.ObjectId; // For double-entry reference
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
