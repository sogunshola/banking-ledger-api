import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { resolveResponse } from '../../shared/resolvers';

@Controller('account')
@ApiBearerAuth()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @ApiOperation({
    summary: 'Create an account',
    description: 'This endpoint allows you to create a new account.',
  })
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
  @ApiOperation({
    summary: 'Get all accounts for the current user',
    description:
      'This endpoint allows you to retrieve all accounts associated with the current user.',
  })
  myAccounts(@CurrentUser() user: User) {
    return resolveResponse(
      this.accountService.findUserAccounts(user),
      'Accounts retrieved successfully',
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get account by ID',
    description: 'This endpoint allows you to retrieve an account by its ID.',
  })
  findOne(@Param('id') id: string) {
    return resolveResponse(this.accountService.findOne(id, '_id'));
  }
}
