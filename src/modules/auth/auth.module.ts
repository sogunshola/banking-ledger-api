import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtStrategy } from './strategy/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { envConfig } from '../../config';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { UserModule } from '../user/user.module';
import { User, UserSchema } from '../user/entities/user.entity';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [
    PassportModule,
    JwtModule.register({
      global: true,
      secret: envConfig.jwtSecret,
      signOptions: {
        expiresIn: envConfig.expiresIn,
      },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserModule,
  ],
})
export class AuthModule {}
