import * as bcrypt from 'bcrypt';
import * as tokenGen from 'otp-generator';
import { v4 as uuidv4 } from 'uuid';
import * as dayjs from 'dayjs';

export class Helper {
  static dayjs = dayjs;

  static async uuid() {
    return uuidv4();
  }

  static async hash(string: string) {
    return bcrypt.hash(string, 10);
  }

  static async compare(original: string, existing: string): Promise<boolean> {
    return bcrypt.compare(original, existing);
  }

  static isEmail(text: string): boolean {
    const regexExp =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;

    return regexExp.test(text);
  }

  static randString(letters: number, numbers: number, either: number) {
    const chars = [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', // letters
      '0123456789', // numbers
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', // either
    ];

    return [letters, numbers, either]
      .map(function (len, i) {
        return Array(len)
          .fill(chars[i])
          .map(function (x) {
            return x[Math.floor(Math.random() * x.length)];
          })
          .join('');
      })
      .concat()
      .join('')
      .split('')
      .sort(function () {
        return 0.5 - Math.random();
      })
      .join('');
  }

  static generateToken(length = 6, options: Record<string, any> = {}) {
    return tokenGen.generate(length, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
      ...options,
    });
  }

  static numberWithCommas(x: number | string): string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}
