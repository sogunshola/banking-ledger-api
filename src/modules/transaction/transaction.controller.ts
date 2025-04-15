import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { DepositWithdrawDto } from './dto/deposit-withdraw.dto';
import { TransferDto } from './dto/transfer.dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { resolveResponse } from '../../shared/resolvers';
import { QueryTransactionsDto } from './dto/query-transaction.dto';
import { BasicPaginationDto } from '../../shared/dto/basic-pagination.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('transaction')
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('deposit')
  deposit(@Body() dto: DepositWithdrawDto, @CurrentUser() user: User) {
    return resolveResponse(
      this.transactionService.deposit(dto, user),
      'Deposit',
    );
  }

  @Post('withdraw')
  withdraw(@Body() dto: DepositWithdrawDto, @CurrentUser() user: User) {
    return resolveResponse(
      this.transactionService.withdraw(dto, user),
      'Withdraw',
    );
  }

  @Post('transfer')
  transfer(@Body() dto: TransferDto, @CurrentUser() user: User) {
    return resolveResponse(
      this.transactionService.transfer(dto, user),
      'Transfer',
    );
  }

  @Get()
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
