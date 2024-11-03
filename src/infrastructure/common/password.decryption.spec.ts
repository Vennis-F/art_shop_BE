import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PasswordDecryption } from './password.decryption';

describe('PasswordDecryption', () => {
  let service: PasswordDecryption;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordDecryption,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'KEY')
                return '8ad8b5350020b04b2d61f3ae508c456b40d029e58849b5339bb26f9e8fb20c35'; // 32 bytes hex
              if (key === 'IV') return '30303030303030303030303030303030'; // 16 bytes hex
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PasswordDecryption>(PasswordDecryption);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should decrypt the password correctly', () => {
    const encryptedPassword = 'd68f7a254e226ab0aefcdf06f101ea51'; // Example encrypted password
    const decryptedPassword =
      service.getDecryptedEnvironmentPassword(encryptedPassword);
    expect(decryptedPassword).toBe('artshop'); // Replace with the actual expected decrypted password
  });

  it('should throw an error if the key is invalid', () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'KEY') return 'invalidkey';
      if (key === 'IV') return 'b'.repeat(32);
      return null;
    });

    expect(() => {
      service.getDecryptedEnvironmentPassword('d4e5f6...');
    }).toThrow();
  });

  it('should throw an error if the IV is invalid', () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'KEY') return 'a'.repeat(64);
      if (key === 'IV') return 'invalidiv';
      return null;
    });

    expect(() => {
      service.getDecryptedEnvironmentPassword('d4e5f6...');
    }).toThrow();
  });

  it('should throw an error if the encrypted password is invalid', () => {
    expect(() => {
      service.getDecryptedEnvironmentPassword('invalidpassword');
    }).toThrow();
  });
});
