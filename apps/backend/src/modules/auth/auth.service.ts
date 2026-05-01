import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { StellarService } from '../../stellar/stellar.service';
import { InstitutionsService } from '../institutions/institutions.service';
import { GraduatesService } from '../graduates/graduates.service';

@Injectable()
export class AuthService {
  constructor(
    private stellarService: StellarService,
    private jwtService: JwtService,
    private institutionsService: InstitutionsService,
    private graduatesService: GraduatesService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async getChallenge(publicKey: string): Promise<{ transaction: string }> {
    const xdr = await this.stellarService.buildChallengeTransaction(publicKey);
    await this.cache.set(`sep10:${publicKey}`, xdr, 300_000);
    return { transaction: xdr };
  }

  async verifyAndLogin(
    publicKey: string,
    signedXdr: string,
    role: 'INSTITUTION' | 'GRADUATE',
  ): Promise<{ accessToken: string; user: any }> {
    const valid = await this.stellarService.verifyChallengeTransaction(
      signedXdr,
      publicKey,
    );
    if (!valid) throw new UnauthorizedException('Invalid Stellar signature');

    const user =
      role === 'INSTITUTION'
        ? await this.institutionsService.findOrCreateByPublicKey(publicKey)
        : await this.graduatesService.findOrCreateByPublicKey(publicKey);

    return {
      accessToken: this.jwtService.sign({ sub: user.id, publicKey, role }),
      user,
    };
  }
}
