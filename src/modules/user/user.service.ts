import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { Helper } from '../../shared/helpers';
import { BasicService } from '../../shared/services/basic-service.service';

@Injectable()
export class UserService extends BasicService<User> {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    super(userModel);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name } = createUserDto;

    const existing = await this.userModel.findOne({ email });
    if (existing) throw new ConflictException('User already exists');

    const hash = await Helper.hash(password);
    const user = new this.userModel({ email, password: hash, name });
    return user.save();
  }

  async findByEmail(email: string) {
    this.findOne(email, 'email');
  }
}
