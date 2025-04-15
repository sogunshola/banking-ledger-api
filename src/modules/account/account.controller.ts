import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { resolveResponse } from '../../shared/resolvers';

@Controller('account')
@ApiBearerAuth()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  create(
    @Body() createAccountDto: CreateAccountDto,
    @CurrentUser() user: User,
  ) {
    return resolveResponse(
      this.accountService.createAccount(user, createAccountDto),
      'Account created successfully',
    );
  }

  @Get('me')
  myAccounts(@CurrentUser() user: User) {
    return resolveResponse(
      this.accountService.findUserAccounts(user),
      'Accounts retrieved successfully',
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.accountService.findOne(id, '_id'));
  }
}
