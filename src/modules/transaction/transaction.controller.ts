import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { DepositWithdrawDto } from './dto/deposit-withdraw.dto';
import { TransferDto } from './dto/transfer.dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { resolveResponse } from '../../shared/resolvers';
import { QueryTransactionsDto } from './dto/query-transaction.dto';
import { BasicPaginationDto } from '../../shared/dto/basic-pagination.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('transaction')
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('deposit')
  @ApiOperation({
    summary: 'Deposit money into your account',
    description: 'This endpoint allows you to deposit money into your account.',
  })
  deposit(@Body() dto: DepositWithdrawDto, @CurrentUser() user: User) {
    return resolveResponse(
      this.transactionService.deposit(dto, user),
      'Deposit',
    );
  }

  @Post('withdraw')
  @ApiOperation({
    summary: 'Withdraw money from your account',
    description:
      'This endpoint allows you to withdraw money from your account.',
  })
  withdraw(@Body() dto: DepositWithdrawDto, @CurrentUser() user: User) {
    return resolveResponse(
      this.transactionService.withdraw(dto, user),
      'Withdraw',
    );
  }

  @Post('transfer')
  @ApiOperation({
    summary: 'Transfer money to another user',
    description: 'This endpoint allows you to transfer money to another user.',
  })
  transfer(@Body() dto: TransferDto, @CurrentUser() user: User) {
    return resolveResponse(
      this.transactionService.transfer(dto, user),
      'Transfer',
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get transaction history',
    description: 'This endpoint allows you to get your transaction history.',
  })
  getTransactions(
    @Query() pagination: BasicPaginationDto,
    @Query() filter: QueryTransactionsDto,
    @CurrentUser() user: User,
  ) {
    return resolveResponse(
      this.transactionService.getTransactionHistory(pagination, filter, user),
    );
  }
}
