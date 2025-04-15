import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { instanceToPlain } from 'class-transformer';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class BasicEntity extends Document {
  _id: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  toJSON() {
    return instanceToPlain(this);
  }
}

export const BasicEntitySchema = SchemaFactory.createForClass(BasicEntity);
