import { Test, TestingModule } from '@nestjs/testing';
import { VerificationService } from './verification.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Credential } from '../credentials/entities/credential.entity';
import { SorobanService } from '../../stellar/soroban.service';
import { IpfsService } from '../../ipfs/ipfs.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockOnChain = {
  status: 'Valid',
  credentialType: 'BACHELORS',
  title: 'Bachelor of Science',
  fieldOfStudy: 'Computer Science',
  grade: 'First Class',
  issueDateUnix: 1700000000n,
  expiryDateUnix: 0n,
  institution: 'GINST...',
  graduate: 'GGRAD...',
  verificationCount: 5n,
  revokedLedger: 0,
  revocationReason: '',
  metadataIpfsHash: 'QmTest',
};

describe('VerificationService', () => {
  let service: VerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        {
          provide: getRepositoryToken(Credential),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: SorobanService,
          useValue: {
            queryContract: jest
              .fn()
              .mockResolvedValueOnce(mockOnChain)
              .mockResolvedValueOnce({ name: 'Unilag', countryCode: 'NG', accreditationBody: 'NUC' }),
          },
        },
        {
          provide: IpfsService,
          useValue: {
            fetchJson: jest.fn().mockResolvedValue({ graduate: { name: 'Amara Diallo' } }),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn().mockResolvedValue(null), set: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(VerificationService);
    process.env.CREDENTIAL_TOKEN_CONTRACT_ID = 'CTEST';
    process.env.INSTITUTION_REGISTRY_CONTRACT_ID = 'CREG';
    process.env.PLATFORM_PUBLIC_KEY = 'GPLATFORM';
  });

  it('should return valid verification result', async () => {
    const result = await service.verifyById('1');
    expect(result.isValid).toBe(true);
    expect(result.graduate.name).toBe('Amara Diallo');
    expect(result.institution.name).toBe('Unilag');
  });
});
