import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">🎓</div>
          <h1>Connect to CertChain</h1>
          <p>Sign in with your Stellar wallet using Freighter</p>
        </div>

        @if (error()) {
          <div class="error-banner">
            <span>⚠️</span> {{ error() }}
          </div>
        }

        <div class="role-cards">
          <button class="role-card" (click)="login('INSTITUTION')" [disabled]="loading()">
            <div class="role-icon">🏛️</div>
            <div class="role-info">
              <div class="role-title">Institution</div>
              <div class="role-desc">Issue & manage credentials for your graduates</div>
            </div>
            <div class="role-arrow">→</div>
          </button>

          <button class="role-card" (click)="login('GRADUATE')" [disabled]="loading()">
            <div class="role-icon">🎓</div>
            <div class="role-info">
              <div class="role-title">Graduate</div>
              <div class="role-desc">View & share your credential wallet</div>
            </div>
            <div class="role-arrow">→</div>
          </button>
        </div>

        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <span>Waiting for Freighter signature...</span>
          </div>
        }

        <div class="login-footer">
          <p>Don't have Freighter? <a href="https://freighter.app" target="_blank">Install it here →</a></p>
          <a routerLink="/" class="back-link">← Back to home</a>
        </div>
      </div>

      <div class="login-info">
        <h2>Why Stellar wallet login?</h2>
        <ul>
          <li>✓ No passwords to remember or leak</li>
          <li>✓ Your keypair proves your identity cryptographically</li>
          <li>✓ SEP-10 standard — same auth used across Stellar ecosystem</li>
          <li>✓ You stay in control of your keys at all times</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: calc(100vh - 64px);
      display: flex; align-items: center; justify-content: center;
      gap: 4rem; padding: 2rem 1.5rem;
    }
    .login-card {
      background: white; border-radius: 16px; padding: 2.5rem;
      box-shadow: var(--shadow-lg); width: 100%; max-width: 420px;
      border: 1px solid var(--gray-200);
    }
    .login-header { text-align: center; margin-bottom: 2rem; }
    .login-logo { font-size: 3rem; margin-bottom: 0.75rem; }
    .login-header h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
    .login-header p { color: var(--gray-600); font-size: 0.9rem; }

    .error-banner {
      background: #fef2f2; border: 1px solid #fecaca; color: #991b1b;
      padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.875rem;
      margin-bottom: 1.25rem; display: flex; gap: 0.5rem; align-items: center;
    }

    .role-cards { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
    .role-card {
      display: flex; align-items: center; gap: 1rem;
      padding: 1.1rem 1.25rem; border: 1.5px solid var(--gray-200);
      border-radius: 12px; background: white; text-align: left;
      cursor: pointer; transition: all .15s; width: 100%;
    }
    .role-card:hover:not(:disabled) {
      border-color: var(--primary); background: var(--primary-light);
    }
    .role-card:disabled { opacity: 0.5; cursor: not-allowed; }
    .role-icon { font-size: 1.75rem; flex-shrink: 0; }
    .role-info { flex: 1; }
    .role-title { font-weight: 700; font-size: 0.95rem; margin-bottom: 2px; }
    .role-desc { font-size: 0.8rem; color: var(--gray-600); }
    .role-arrow { color: var(--gray-400); font-size: 1.1rem; }

    .loading-state {
      display: flex; align-items: center; justify-content: center; gap: 0.75rem;
      padding: 1rem; color: var(--gray-600); font-size: 0.875rem;
    }
    .spinner {
      width: 20px; height: 20px; border: 2px solid var(--gray-200);
      border-top-color: var(--primary); border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .login-footer { text-align: center; font-size: 0.8rem; color: var(--gray-400); }
    .login-footer a { color: var(--primary); }
    .back-link { display: block; margin-top: 0.75rem; }

    .login-info {
      max-width: 300px;
    }
    .login-info h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; }
    .login-info ul { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
    .login-info li { font-size: 0.875rem; color: var(--gray-600); }

    @media (max-width: 768px) {
      .login-page { flex-direction: column; }
      .login-info { display: none; }
    }
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
