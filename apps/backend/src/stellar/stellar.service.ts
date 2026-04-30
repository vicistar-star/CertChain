import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Keypair,
  Networks,
  TransactionBuilder,
  Operation,
  Horizon,
} from '@stellar/stellar-sdk';
import { randomBytes } from 'crypto';

@Injectable()
export class StellarService {
  private server: Horizon.Server;
  private networkPassphrase: string;

  constructor(private config: ConfigService) {
    const isTestnet = config.get('STELLAR_NETWORK') === 'testnet';
    this.server = new Horizon.Server(
      isTestnet
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org',
    );
    this.networkPassphrase = isTestnet ? Networks.TESTNET : Networks.PUBLIC;
  }

  generateKeypair(): { publicKey: string; secretKey: string } {
    const keypair = Keypair.random();
    return { publicKey: keypair.publicKey(), secretKey: keypair.secret() };
  }

  async fundTestnetAccount(publicKey: string): Promise<void> {
    await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`,
    );
  }

  async buildChallengeTransaction(clientPublicKey: string): Promise<string> {
    const serverAccount = await this.server.loadAccount(
      this.config.get('STELLAR_SERVER_PUBLIC_KEY'),
    );
    const transaction = new TransactionBuilder(serverAccount, {
      fee: '100',
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.manageData({
          name: 'certchain-africa auth',
          value: randomBytes(48).toString('base64'),
          source: clientPublicKey,
        }),
      )
      .setTimeout(300)
      .build();

    const serverKeypair = Keypair.fromSecret(
      this.config.get('STELLAR_SERVER_SECRET_KEY'),
    );
    transaction.sign(serverKeypair);
    return transaction.toEnvelope().toXDR('base64');
  }

  async verifyChallengeTransaction(
    signedXdr: string,
    clientPublicKey: string,
  ): Promise<boolean> {
    try {
      const transaction = TransactionBuilder.fromXDR(
        signedXdr,
        this.networkPassphrase,
      );
      const keypair = Keypair.fromPublicKey(clientPublicKey);
      return transaction.signatures.some((sig) =>
        keypair.verify(transaction.hash(), sig.signature()),
      );
    } catch {
      return false;
    }
  }

  getNetworkPassphrase(): string {
    return this.networkPassphrase;
  }
}
