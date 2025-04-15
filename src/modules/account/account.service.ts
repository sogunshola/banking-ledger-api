import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/entities/user.entity';
import { Helper } from '../../shared/helpers';
import { BasicService } from '../../shared/services/basic-service.service';

@Injectable()
export class AccountService extends BasicService<Account> {
  constructor(@InjectModel(Account.name) private accountModel: Model<Account>) {
    super(accountModel);
  }

  /**
   * Creates a new account for the specified user with the given details.
   *
   * @param user - The user for whom the account is being created.
   * @param dto - The data transfer object containing account creation details, such as currency.
   * @returns A promise that resolves to the created account.
   * @throws ConflictException - If the user already has an account in the specified currency.
   */
  async createAccount(user: User, dto: CreateAccountDto): Promise<Account> {
    const existing = await this.accountModel.findOne({
      user: user._id,
      currency: dto.currency,
    });
    if (existing)
      throw new ConflictException(`User already has a ${dto.currency} account`);

    const accountNumber = await this.generateAccountNumber();

    return this.accountModel.create({
      user: user._id,
      currency: dto.currency,
      accountNumber,
    });
  }

  private async generateAccountNumber(): Promise<string> {
    const accountNumber = Helper.generateToken(10);

    // check if account number already exists and generate a new one if it does
    const check = await this.accountModel.findOne({ accountNumber });
    if (check) {
      return this.generateAccountNumber();
    }
    return accountNumber.toString();
  }

  async findUserAccounts(user: User): Promise<Account[]> {
    return this.accountModel
      .find({ user: user._id })
      .populate('user', '-password');
  }
}
