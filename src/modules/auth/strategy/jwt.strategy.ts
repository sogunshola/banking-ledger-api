import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { envConfig } from '../../../config';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      secretOrKey: envConfig.jwtSecret,
    });
  }

  async validate(payload: { id: string }) {
    const user = await await this.userService.findOne(payload.id, '_id');
    if (!user) {
      throw new UnauthorizedException();
    }

    const { password, ...result } = user.toJSON();

    return result;
  }
}
