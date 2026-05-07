import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WalletService } from './wallet.service';

export interface AuthResponse {
  accessToken: string;
  user: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient, private wallet: WalletService) {}

  async loginWithFreighter(role: 'INSTITUTION' | 'GRADUATE'): Promise<AuthResponse> {
    const publicKey = await this.wallet.connect();

    const { transaction } = await firstValueFrom(
      this.http.post<{ transaction: string }>(`${this.api}/auth/challenge`, { publicKey })
    );

    const signedXdr = await this.wallet.signTransaction(transaction, environment.stellarNetwork);

    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.api}/auth/verify`, { publicKey, signedXdr, role })
    );

    localStorage.setItem('certchain_token', response.accessToken);
    localStorage.setItem('certchain_role', role);
    return response;
  }

  logout(): void {
    localStorage.removeItem('certchain_token');
    localStorage.removeItem('certchain_role');
    this.wallet.disconnect();
  }

  getToken(): string | null { return localStorage.getItem('certchain_token'); }
  getRole(): string | null { return localStorage.getItem('certchain_role'); }
  isLoggedIn(): boolean { return !!this.getToken(); }
}
