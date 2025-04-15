import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Helper } from '../../shared/helpers';
import { User } from '../user/entities/user.entity';

describe('AuthService - signUp', () => {
  let authService: AuthService;
  let userModel: any;
  let userService: any;
  let jwtService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User.name));
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should throw ConflictException if email is already taken', async () => {
    const signupDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };
    userModel.findOne.mockResolvedValue({ email: 'test@example.com' });

    await expect(authService.signUp(signupDto)).rejects.toThrow(
      ConflictException,
    );
    expect(userModel.findOne).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
  });

  it('should create a new user and return a signed token', async () => {
    const signupDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };
    const createdUser = {
      toJSON: jest
        .fn()
        .mockReturnValue({ _id: 'userId', email: 'test@example.com' }),
    };
    userModel.findOne.mockResolvedValue(null);
    userService.create.mockResolvedValue(createdUser);
    jwtService.sign.mockReturnValue('signed-token');

    const result = await authService.signUp(signupDto);

    expect(userModel.findOne).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
    expect(userService.create).toHaveBeenCalledWith(signupDto);
    expect(jwtService.sign).toHaveBeenCalledWith(
      { id: 'userId' },
      { secret: expect.any(String) },
    );
    expect(result).toEqual({
      token: 'signed-token',
      user: { _id: 'userId', email: 'test@example.com' },
    });
  });

  describe('AuthService - login', () => {
    it('should throw UnauthorizedException if user is not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };
      userModel.findOne.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: 'nonexistent@example.com',
      });
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const user = { password: 'hashedpassword' };
      userModel.findOne.mockResolvedValue(user);
      jest.spyOn(Helper, 'compare').mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(Helper.compare).toHaveBeenCalledWith(
        'wrongpassword',
        'hashedpassword',
      );
    });

    it('should return a signed token if login is successful', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const user = {
        _id: 'userId',
        email: 'test@example.com',
        password: 'hashedpassword',
        toJSON: jest.fn().mockReturnValue({
          _id: 'userId',
          email: 'test@example.com',
        }),
      };
      userModel.findOne.mockResolvedValue(user);
      jest.spyOn(Helper, 'compare').mockResolvedValue(true);
      jwtService.sign.mockReturnValue('signed-token');

      const result = await authService.login(loginDto);

      expect(userModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(Helper.compare).toHaveBeenCalledWith(
        'password123',
        'hashedpassword',
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        { id: 'userId' },
        { secret: expect.any(String) },
      );
      expect(result).toEqual({
        token: 'signed-token',
        user: { _id: 'userId', email: 'test@example.com' },
      });
    });
  });
});
