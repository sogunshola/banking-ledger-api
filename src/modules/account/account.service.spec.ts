import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException } from '@nestjs/common';
import { AccountService } from './account.service';
import { Account, Currency } from './entities/account.entity';
import { User } from '../user/entities/user.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { Types } from 'mongoose';

describe('AccountService', () => {
  let service: AccountService;
  let accountModel: any;

  beforeEach(async () => {
    const mockAccountModel = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn().mockImplementation((dto) => ({
        _id: new Types.ObjectId(),
        ...dto,
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getModelToken(Account.name),
          useValue: mockAccountModel,
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    accountModel = module.get(getModelToken(Account.name));
  });

  it('should create a new account successfully', async () => {
    const user: User = {
      _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    } as User;
    const dto: CreateAccountDto = { currency: Currency.USD };

    accountModel.findOne.mockResolvedValue(null);
    jest
      .spyOn(service as any, 'generateAccountNumber')
      .mockResolvedValue('1234567890');

    const result = await service.createAccount(user, dto);

    expect(accountModel.findOne).toHaveBeenCalledWith({
      user: user._id,
      currency: dto.currency,
    });
    expect(service['generateAccountNumber']).toHaveBeenCalled();
    expect(accountModel.create).toHaveBeenCalledWith({
      user: user._id,
      currency: dto.currency,
      accountNumber: '1234567890',
    });
    expect(result).toEqual({
      _id: expect.any(Types.ObjectId),
      user: user._id,
      currency: dto.currency,
      accountNumber: '1234567890',
    });
  });

  it('should throw ConflictException if account already exists', async () => {
    const user: User = {
      _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    } as User;
    const dto: CreateAccountDto = { currency: Currency.USD };

    accountModel.findOne.mockResolvedValue({ _id: 'existingAccountId' });
    jest
      .spyOn(service as any, 'generateAccountNumber')
      .mockResolvedValue('1234567890');

    await expect(service.createAccount(user, dto)).rejects.toThrow(
      new ConflictException(`User already has a ${dto.currency} account`),
    );

    expect(accountModel.findOne).toHaveBeenCalledWith({
      user: user._id,
      currency: dto.currency,
    });
    expect(service['generateAccountNumber']).not.toHaveBeenCalled();
  });
});
