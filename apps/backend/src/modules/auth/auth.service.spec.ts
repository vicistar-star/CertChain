import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { StellarService } from '../../stellar/stellar.service';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InstitutionsService } from '../institutions/institutions.service';
import { GraduatesService } from '../graduates/graduates.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let stellarService: jest.Mocked<StellarService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: StellarService,
          useValue: {
            buildChallengeTransaction: jest.fn().mockResolvedValue('xdr_challenge'),
            verifyChallengeTransaction: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('jwt_token') },
        },
        {
          provide: InstitutionsService,
          useValue: {
            findOrCreateByPublicKey: jest.fn().mockResolvedValue({ id: 'inst-1' }),
          },
        },
        {
          provide: GraduatesService,
          useValue: {
            findOrCreateByPublicKey: jest.fn().mockResolvedValue({ id: 'grad-1' }),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: { set: jest.fn(), get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    stellarService = module.get(StellarService) as any;
    jwtService = module.get(JwtService) as any;
  });

  it('should return challenge transaction', async () => {
    const result = await service.getChallenge('GPUBKEY');
    expect(result.transaction).toBe('xdr_challenge');
  });

  it('should return JWT on valid signature', async () => {
    const result = await service.verifyAndLogin('GPUBKEY', 'signed_xdr', 'INSTITUTION');
    expect(result.accessToken).toBe('jwt_token');
  });

  it('should throw on invalid signature', async () => {
    stellarService.verifyChallengeTransaction.mockResolvedValue(false);
    await expect(
      service.verifyAndLogin('GPUBKEY', 'bad_xdr', 'INSTITUTION'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
