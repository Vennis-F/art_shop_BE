import { Test, TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import { PasswordDecryption } from './password.decryption';

dotenv.config();

describe('PasswordDecryption', () => {
  let service: PasswordDecryption;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordDecryption],
    }).compile();

    service = module.get<PasswordDecryption>(PasswordDecryption);
  });

  it('should decrypt a valid encrypted password', () => {
    const encryptedPassword =
      '30303030303030303030303030303030:3be46716c641234c83ef51ca2d0b8d37';
    const decryptedPassword =
      service.getDecryptedEnvironmentPassword(encryptedPassword);
    expect(decryptedPassword).toBe('kuliSG');
  });

  it('should throw an error if KEY is not defined', () => {
    process.env.KEY = '';
    const encryptedPassword = '0000000000000000:encryptedTextHere';
    expect(() =>
      service.getDecryptedEnvironmentPassword(encryptedPassword),
    ).toThrow();
  });

  it('should throw an error if encrypted password format is invalid', () => {
    const invalidEncryptedPassword = 'invalidFormat';
    expect(() =>
      service.getDecryptedEnvironmentPassword(invalidEncryptedPassword),
    ).toThrow();
  });

  it('should throw an error if IV is invalid', () => {
    const encryptedPassword = 'invalidIV:encryptedTextHere';
    expect(() =>
      service.getDecryptedEnvironmentPassword(encryptedPassword),
    ).toThrow();
  });

  it('should throw an error if encrypted text is invalid', () => {
    const encryptedPassword = '0000000000000000:invalidEncryptedText';
    expect(() =>
      service.getDecryptedEnvironmentPassword(encryptedPassword),
    ).toThrow();
  });
});
