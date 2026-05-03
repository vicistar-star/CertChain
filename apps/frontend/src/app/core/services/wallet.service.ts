import { Injectable, signal } from '@angular/core';
import { map, BehaviorSubject } from 'rxjs';

declare const window: any;

@Injectable({ providedIn: 'root' })
export class WalletService {
  private publicKeySubject = new BehaviorSubject<string | null>(null);
  readonly connected$ = this.publicKeySubject.pipe(map(Boolean));
  readonly publicKey$ = this.publicKeySubject.asObservable();

  async connect(): Promise<string> {
    if (!window.freighter) {
      throw new Error('Please install the Freighter wallet extension.');
    }
    const { isConnected } = await window.freighter.isConnected();
    if (!isConnected) {
      throw new Error('Freighter is not connected. Please unlock your wallet.');
    }
    const { publicKey } = await window.freighter.getPublicKey();
    this.publicKeySubject.next(publicKey);
    return publicKey;
  }

  async signTransaction(xdr: string, network: 'TESTNET' | 'PUBLIC'): Promise<string> {
    const { signedTxXdr } = await window.freighter.signTransaction(xdr, {
      networkPassphrase: network === 'TESTNET'
        ? 'Test SDF Network ; September 2015'
        : 'Public Global Stellar Network ; September 2015',
    });
    return signedTxXdr;
  }

  disconnect(): void {
    this.publicKeySubject.next(null);
  }

  getPublicKey(): string | null {
    return this.publicKeySubject.getValue();
  }
}
