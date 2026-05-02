import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { nativeToScVal } from '@stellar/stellar-sdk';
import { Credential } from '../credentials/entities/credential.entity';
import { SorobanService } from '../../stellar/soroban.service';
import { IpfsService } from '../../ipfs/ipfs.service';

export interface VerificationResult {
  credentialId: string;
  isValid: boolean;
  status: string;
  credential: {
    type: string;
    title: string;
    fieldOfStudy: string;
    grade: string;
    issueDate: Date;
    expiryDate: Date | null;
  };
  institution: {
    name: string;
    country: string;
    accreditationBody: string;
    stellarAddress: string;
  };
  graduate: { stellarAddress: string; name: string };
  verificationCount: number;
  revokedAt: { ledger: number; reason: string } | null;
  verifiedAt: Date;
}

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(Credential) private credRepo: Repository<Credential>,
    private sorobanService: SorobanService,
    private ipfsService: IpfsService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async verifyById(credentialId: string): Promise<VerificationResult> {
    const cacheKey = `verify:${credentialId}`;
    const cached = await this.cache.get<VerificationResult>(cacheKey);
    if (cached) return cached;

    // Stellar ledger is the source of truth
    const onChain = await this.sorobanService.queryContract<any>({
      contractId: process.env.CREDENTIAL_TOKEN_CONTRACT_ID,
      method: 'verify',
      args: [nativeToScVal(BigInt(credentialId), { type: 'u64' })],
      callerPublicKey: process.env.PLATFORM_PUBLIC_KEY,
    });

    const metadata = await this.ipfsService.fetchJson<any>(onChain.metadataIpfsHash);

    const institution = await this.sorobanService.queryContract<any>({
      contractId: process.env.INSTITUTION_REGISTRY_CONTRACT_ID,
      method: 'get_institution',
      args: [nativeToScVal(onChain.institution, { type: 'address' })],
      callerPublicKey: process.env.PLATFORM_PUBLIC_KEY,
    });

    const result: VerificationResult = {
      credentialId,
      isValid: onChain.status === 'Valid',
      status: onChain.status,
      credential: {
        type: onChain.credentialType,
        title: onChain.title,
        fieldOfStudy: onChain.fieldOfStudy,
        grade: onChain.grade,
        issueDate: new Date(Number(onChain.issueDateUnix) * 1000),
        expiryDate:
          onChain.expiryDateUnix > 0n
            ? new Date(Number(onChain.expiryDateUnix) * 1000)
            : null,
      },
      institution: {
        name: institution.name,
        country: institution.countryCode,
        accreditationBody: institution.accreditationBody,
        stellarAddress: onChain.institution,
      },
      graduate: {
        stellarAddress: onChain.graduate,
        name: metadata.graduate?.name ?? 'Unknown',
      },
      verificationCount: Number(onChain.verificationCount),
      revokedAt:
        onChain.revokedLedger > 0
          ? { ledger: onChain.revokedLedger, reason: onChain.revocationReason }
          : null,
      verifiedAt: new Date(),
    };

    if (result.isValid) {
      await this.cache.set(cacheKey, result, 300_000);
    }

    return result;
  }

  async verifyBySlug(slug: string): Promise<VerificationResult> {
    const cred = await this.credRepo.findOne({ where: { shareSlug: slug } });
    if (!cred) throw new Error('Credential not found');
    return this.verifyById(cred.stellarCredentialId);
  }

  async bulkVerify(ids: string[]): Promise<VerificationResult[]> {
    return Promise.all(ids.map((id) => this.verifyById(id)));
  }
}
