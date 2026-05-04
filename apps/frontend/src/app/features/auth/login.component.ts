import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="login-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>CertChain Africa</mat-card-title>
          <mat-card-subtitle>Connect your Stellar wallet to continue</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (error()) {
            <p class="error">{{ error() }}</p>
          }
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="login('INSTITUTION')" [disabled]="loading()">
            @if (loading()) { <mat-spinner diameter="20"></mat-spinner> }
            Login as Institution
          </button>
          <button mat-stroked-button (click)="login('GRADUATE')" [disabled]="loading()">
            Login as Graduate
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container { display: flex; justify-content: center; align-items: center; min-height: 80vh; }
    mat-card { width: 400px; }
    mat-card-actions { display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem; }
    .error { color: #ef4444; font-size: 0.875rem; }
  `],
})
export class LoginComponent {
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private auth: AuthService, private router: Router) {}

  async login(role: 'INSTITUTION' | 'GRADUATE') {
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.auth.loginWithFreighter(role);
      this.router.navigate([role === 'INSTITUTION' ? '/institution/dashboard' : '/graduate/wallet']);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }
}
