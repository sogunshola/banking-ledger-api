import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BasicService } from '../../shared/services/basic-service.service';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, ClientSession, Types } from 'mongoose';
import { Account } from '../account/entities/account.entity';
import { DepositWithdrawDto } from './dto/deposit-withdraw.dto';
import { User } from '../user/entities/user.entity';
import { Helper } from '../../shared/helpers';
import { TransferDto } from './dto/transfer.dto';
import { BasicPaginationDto } from '../../shared/dto/basic-pagination.dto';
import { QueryTransactionsDto } from './dto/query-transaction.dto';

@Injectable()
export class TransactionService extends BasicService<Transaction> {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectConnection() private connection: Connection,
  ) {
    super(transactionModel);
  }

  /**
   * Handles the deposit operation for a user's account.
   *
   * @param dto - The data transfer object containing deposit details, including the account ID and amount.
   * @param user - The user performing the deposit operation.
   * @returns A promise that resolves to the created transaction object.
   *
   * @throws {Error} If the user's account is invalid or cannot be found.
   * @throws {Error} If the transaction fails to be created or saved.
   */
  async deposit(dto: DepositWithdrawDto, user: User) {
    return this.executeInTransaction(async (session) => {
      const account = await this.validateUserAccount(
        dto.accountId,
        user._id,
        session,
      );

      account.balance += dto.amount;
      await account.save({ session });

      const tx = await this.createTransaction({
        accountId: account._id,
        type: TransactionType.CREDIT,
        amount: dto.amount,
        narration: dto.narration || 'Deposit',
        session,
      });

      return tx;
    });
  }

  /**
   * Handles the withdrawal of funds from a user's account.
   *
   * @param dto - The data transfer object containing withdrawal details, including the account ID and amount.
   * @param user - The user initiating the withdrawal.
   * @returns A promise that resolves to the created transaction object.
   * @throws {BadRequestException} If the account has insufficient funds for the withdrawal.
   */
  async withdraw(dto: DepositWithdrawDto, user: User) {
    return this.executeInTransaction(async (session) => {
      const account = await this.validateUserAccount(
        dto.accountId,
        user._id,
        session,
      );

      if (account.balance < dto.amount) {
        throw new BadRequestException('Insufficient funds');
      }

      account.balance -= dto.amount;
      await account.save({ session });

      const tx = await this.createTransaction({
        accountId: account._id,
        type: TransactionType.DEBIT,
        amount: dto.amount,
        narration: dto.narration || 'Withdrawal',
        session,
      });

      return tx;
    });
  }

  /**
   * Transfers a specified amount from one account to another, ensuring all necessary
   * validations and transactional integrity. This method performs the following checks:
   * - Ensures the source and destination accounts are not the same.
   * - Verifies that both accounts exist.
   * - Confirms that the source account belongs to the authenticated user.
   * - Checks that both accounts use the same currency.
   * - Ensures the source account has sufficient balance for the transfer.
   *
   * The transfer is executed within a database transaction to maintain consistency.
   * Two transaction records are created: one for the debit from the source account
   * and one for the credit to the destination account. These transactions are linked
   * to each other for traceability.
   *
   * @param dto - The transfer details, including source account, destination account,
   *              amount, and optional narration.
   * @param user - The authenticated user initiating the transfer.
   * @returns An object containing the debit and credit transaction records.
   * @throws {BadRequestException} If the source and destination accounts are the same,
   *                               if there is a currency mismatch, or if the source
   *                               account has insufficient balance.
   * @throws {NotFoundException} If one or both accounts are not found, or if the source
   *                             account does not belong to the authenticated user.
   */
  async transfer(dto: TransferDto, user: User) {
    if (dto.fromAccountId === dto.toAccountId) {
      throw new BadRequestException('Cannot transfer to same account');
    }

    return this.executeInTransaction(async (session) => {
      const [from, to] = await Promise.all([
        this.accountModel.findById(dto.fromAccountId).session(session),
        this.accountModel.findById(dto.toAccountId).session(session),
      ]);

      if (!from || !to) {
        throw new NotFoundException('One or both accounts not found');
      }

      // Ensure from account belongs to user
      if (from.user.toString() !== user._id.toString()) {
        throw new NotFoundException('Account not found');
      }

      if (from.currency !== to.currency) {
        throw new BadRequestException('Currency mismatch');
      }

      if (from.balance < dto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      from.balance -= dto.amount;
      to.balance += dto.amount;

      await from.save({ session });
      await to.save({ session });

      const reference = this.generateRef();

      const debitTx = new this.transactionModel({
        account: from._id,
        type: TransactionType.DEBIT,
        amount: dto.amount,
        narration: dto.narration || 'Transfer out',
        reference,
      });

      const creditTx = new this.transactionModel({
        account: to._id,
        type: TransactionType.CREDIT,
        amount: dto.amount,
        narration: dto.narration || 'Transfer in',
        reference,
      });

      // Link the transactions to each other
      debitTx.linkedTransaction = creditTx._id;
      creditTx.linkedTransaction = debitTx._id;

      await debitTx.save({ session });
      await creditTx.save({ session });

      return { transaction: debitTx, linkedTransaction: creditTx };
    });
  }

  private generateRef(): string {
    return 'TX-' + Helper.randString(5, 4, 5);
  }

  private async executeInTransaction<T>(
    operation: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await operation(session);
      await session.commitTransaction();
      return result;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  private async validateUserAccount(
    accountId: string,
    userId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<Account> {
    const account = await this.accountModel
      .findById(accountId)
      .session(session)
      .exec();

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.user.toString() !== userId.toString()) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  private async createTransaction({
    accountId,
    type,
    amount,
    narration,
    session,
    linkedTransactionId = undefined,
    customReference = undefined,
  }: {
    accountId: any;
    type: TransactionType;
    amount: number;
    narration: string;
    session: ClientSession;
    linkedTransactionId?: any;
    customReference?: string;
  }): Promise<Transaction> {
    const tx = await this.transactionModel.create(
      [
        {
          account: accountId,
          type,
          amount,
          narration,
          reference: customReference || this.generateRef(),
          ...(linkedTransactionId && {
            linkedTransaction: linkedTransactionId,
          }),
        },
      ],
      { session },
    );

    return tx[0];
  }

  async getTransactionByRef(reference: string): Promise<Transaction | null> {
    return this.findOne(reference, 'reference');
  }

  /**
   * Retrieves the transaction history for a specific account with optional filters and pagination.
   *
   * @param pagination - An object containing pagination details such as page number and limit.
   * @param query - An object containing query parameters to filter transactions, including:
   *   - `accountId` (string): The ID of the account to retrieve transactions for.
   *   - `type` (string, optional): The type of transactions to filter by.
   *   - `reference` (string, optional): A reference string to filter transactions.
   *   - `fromDate` (Date, optional): The start date to filter transactions from.
   *   - `toDate` (Date, optional): The end date to filter transactions up to.
   * @param user - The user object representing the currently authenticated user.
   *
   * @returns A promise that resolves to a paginated list of transactions matching the provided filters.
   *
   * @throws Will throw an error if the specified account does not belong to the authenticated user.
   */
  async getTransactionHistory(
    pagination: BasicPaginationDto,
    query: QueryTransactionsDto,
    user: User,
  ) {
    const { accountId, type, reference, fromDate, toDate } = query;

    // Check if the account belongs to the user
    await this.validateUserAccount(accountId, user._id);

    const filter: any = { account: new Types.ObjectId(accountId) };

    if (type) filter.type = type;
    if (reference) filter.reference = reference;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = fromDate;
      if (toDate) filter.createdAt.$lte = toDate;
    }

    const populateOptions = {
      path: 'account',
      select: 'accountNumber currency',
    };
    return this.findAll(filter, pagination, populateOptions);
  }
}
