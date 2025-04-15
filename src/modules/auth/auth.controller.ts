import { Controller, Post, Body, Get, UseGuards, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../shared/decorators/public.decorator';
import { resolveResponse } from '../../shared/resolvers';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  @ApiOperation({
    summary: 'Sign up',
    description: 'This endpoint allows you to sign up for a new account.',
  })
  async signUp(@Body() signupDto: SignUpDto) {
    return resolveResponse(this.authService.signUp(signupDto));
  }

  @Post('login')
  @Public()
  @ApiOperation({
    summary: 'Login',
    description: 'This endpoint allows you to log in to your account.',
  })
  async signin(@Body() loginDto: LoginDto) {
    return resolveResponse(this.authService.login(loginDto));
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user',
    description: 'This endpoint allows you to get the current logged-in user.',
  })
  async me(@CurrentUser() user: any) {
    return resolveResponse(user);
  }
}
