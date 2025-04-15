import { Controller, Post, Body, Get, UseGuards, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../shared/decorators/public.decorator';
import { resolveResponse } from '../../shared/resolvers';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  async signUp(@Body() signupDto: SignUpDto) {
    return resolveResponse(this.authService.signUp(signupDto));
  }

  @Post('login')
  @Public()
  async signin(@Body() loginDto: LoginDto) {
    return resolveResponse(this.authService.login(loginDto));
  }

  @Get('me')
  async me(@CurrentUser() user: any) {
    return resolveResponse(user);
  }
}
