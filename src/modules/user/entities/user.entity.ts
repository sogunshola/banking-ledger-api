import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BasicEntity } from '../../../shared/entities/basic-entity';
import { Exclude } from 'class-transformer';

@Schema()
export class User extends BasicEntity {
  @Prop({ type: String, unique: true, required: true })
  email: string;

  @Exclude()
  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, default: null })
  name: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
