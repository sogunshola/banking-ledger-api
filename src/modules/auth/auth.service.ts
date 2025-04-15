import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Helper } from '../../shared/helpers';
import { envConfig } from '../../config';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private usersService: UserService,
  ) {}

  async signUp(signupDto: SignUpDto) {
    const { email } = signupDto;
    // check if email already exits
    const isEmailTaken = await this.userModel.findOne({ email });

    if (isEmailTaken) {
      throw new ConflictException('email is taken');
    }

    const user = await this.usersService.create(signupDto);

    return this.signToken(user.toJSON());
    // event that triggers after user is created to send email or do any other thing
    // this.eventEmitter.emit('user.created', user);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({
      email,
    });

    if (!user) throw new UnauthorizedException('invalid email or password');
    const passwordMatch = await Helper.compare(password, user.password);
    if (!passwordMatch)
      throw new UnauthorizedException('invalid email or password');

    return this.signToken(user.toJSON());
  }

  private signToken(user: any) {
    const token = this.jwtService.sign(
      { id: user._id },
      {
        secret: envConfig.jwtSecret,
      },
    );
    const { password: userPassword, ...others } = user;
    return { token, user: others };
  }
}
