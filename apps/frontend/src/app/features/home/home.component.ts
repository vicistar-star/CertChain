import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="home">

      <!-- Hero -->
      <section class="hero">
        <div class="hero-inner">
          <div class="hero-badge">Built on Stellar · Soroban Smart Contracts</div>
          <h1>Academic credentials<br><span class="gradient-text">Africa can trust</span></h1>
          <p class="hero-sub">
            Institutions issue tamper-proof credentials on-chain. Graduates own them forever.
            Employers verify in seconds — no phone calls, no waiting.
          </p>

          <div class="verify-box">
            <div class="verify-input-wrap">
              <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
              </svg>
              <input
                [(ngModel)]="credId"
                placeholder="Enter credential ID  e.g. 4821"
                (keyup.enter)="verify()"
                class="verify-input"
              />
            </div>
            <button class="btn-primary" (click)="verify()">Verify Credential</button>
          </div>

          <div class="hero-cta">
            <a routerLink="/auth/login" class="btn-secondary">Institution Portal →</a>
            <a routerLink="/auth/login" class="btn-ghost">Graduate Wallet →</a>
          </div>
        </div>

        <div class="hero-visual">
          <div class="credential-preview">
            <div class="cred-header">
              <div class="cred-logo">🏛️</div>
              <div>
                <div class="cred-inst">University of Lagos</div>
                <div class="cred-accred">NUC Accredited · Nigeria</div>
              </div>
              <span class="badge badge-valid">✓ Verified</span>
            </div>
            <div class="cred-divider"></div>
            <div class="cred-title">Bachelor of Science</div>
            <div class="cred-field">Computer Science · First Class Honours</div>
            <div class="cred-name">Amara Diallo</div>
            <div class="cred-meta">
              <span>Issued June 15, 2023</span>
              <span>Verified 12 times</span>
            </div>
            <div class="cred-chain">
              <svg viewBox="0 0 20 20" fill="currentColor" width="12"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/></svg>
              Stellar Mainnet · Credential #4821
            </div>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="stats-bar">
        <div class="stat-item">
          <div class="stat-num">3</div>
          <div class="stat-label">Pilot Institutions</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-num">~$0.00001</div>
          <div class="stat-label">Per Issuance</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-num">&lt; 2s</div>
          <div class="stat-label">Verification Time</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-num">54</div>
          <div class="stat-label">African Countries</div>
        </div>
      </section>

      <!-- Features -->
      <section class="features">
        <h2 class="section-title">Why CertChain?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Cryptographically unforgeable</h3>
            <p>Credentials are signed by the institution's Stellar keypair and stored on the immutable SCP ledger. No central database to hack.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Instant verification</h3>
            <p>Any employer visits a single URL. No institution phone calls. No waiting weeks for a verification letter. Result in under 2 seconds.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👤</div>
            <h3>Self-sovereign ownership</h3>
            <p>Credentials are soul-bound to the graduate's Stellar wallet — not the institution. Institution closure doesn't erase your records.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔄</div>
            <h3>Real-time revocation</h3>
            <p>Institutions can revoke credentials instantly. Verifiers always see live status — no stale cached results beyond 5 minutes.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🌍</div>
            <h3>Pan-African by design</h3>
            <p>No geographic borders on Stellar. A credential from Nairobi verifies the same way in Lagos, Accra, or Johannesburg.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📋</div>
            <h3>Bulk issuance</h3>
            <p>Upload a graduation CSV and mint credentials for an entire cohort in one batch transaction — up to 500 at once.</p>
          </div>
        </div>
      </section>

      <!-- How it works -->
      <section class="how-it-works">
        <h2 class="section-title">How it works</h2>
        <div class="steps">
          <div class="step">
            <div class="step-num">1</div>
            <h3>Institution registers</h3>
            <p>Accredited universities and professional bodies anchor their identity on Stellar, verified against NUC, WAEC, KNQA, and other bodies.</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-num">2</div>
            <h3>Credential issued on-chain</h3>
            <p>The institution mints a soul-bound credential token to the graduate's Stellar address. Metadata stored on IPFS.</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-num">3</div>
            <h3>Graduate shares a link</h3>
            <p>One URL or QR code per credential. Share with any employer globally — no login required to verify.</p>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-num">4</div>
            <h3>Employer verifies instantly</h3>
            <p>The Soroban contract returns cryptographic proof. Valid, revoked, or expired — in under 2 seconds.</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <p>© 2025 CertChain Africa · Built on <a href="https://stellar.org" target="_blank">Stellar</a> · MIT License</p>
        <p class="footer-quote">"Education is the most powerful weapon you can use to change the world." — Nelson Mandela</p>
      </footer>
    </div>
  `,
  styles: [`
    .home { }

    /* Hero */
    .hero {
      display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center;
      max-width: 1100px; margin: 0 auto; padding: 4rem 1.5rem 3rem;
    }
    .hero-badge {
      display: inline-block; background: var(--primary-light); color: var(--primary);
      font-size: 0.75rem; font-weight: 600; padding: 4px 12px; border-radius: 999px;
      margin-bottom: 1.25rem; letter-spacing: .03em;
    }
    h1 { font-size: 3rem; font-weight: 800; line-height: 1.15; margin-bottom: 1rem; }
    .gradient-text {
      background: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .hero-sub { font-size: 1.05rem; color: var(--gray-600); line-height: 1.7; margin-bottom: 2rem; }

    .verify-box { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; }
    .verify-input-wrap { position: relative; flex: 1; }
    .search-icon {
      position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
      width: 18px; height: 18px; color: var(--gray-400);
    }
    .verify-input {
      width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 1.5px solid var(--gray-200); border-radius: 10px;
      font-size: 0.95rem; font-family: inherit; outline: none;
      transition: border-color .15s;
    }
    .verify-input:focus { border-color: var(--primary); }

    .btn-primary {
      padding: 0.75rem 1.5rem; background: var(--primary); color: white;
      border: none; border-radius: 10px; font-size: 0.9rem; font-weight: 600;
      white-space: nowrap; transition: background .15s;
    }
    .btn-primary:hover { background: var(--primary-dark); }

    .hero-cta { display: flex; gap: 0.75rem; }
    .btn-secondary {
      padding: 0.6rem 1.25rem; background: var(--gray-900); color: white;
      border-radius: 10px; font-size: 0.875rem; font-weight: 600; transition: background .15s;
    }
    .btn-secondary:hover { background: var(--gray-800); }
    .btn-ghost {
      padding: 0.6rem 1.25rem; color: var(--gray-600);
      border: 1.5px solid var(--gray-200); border-radius: 10px;
      font-size: 0.875rem; font-weight: 600; transition: all .15s;
    }
    .btn-ghost:hover { border-color: var(--primary); color: var(--primary); }

    /* Credential preview card */
    .hero-visual { display: flex; justify-content: center; }
    .credential-preview {
      background: white; border-radius: 16px; padding: 1.75rem;
      box-shadow: var(--shadow-lg); width: 100%; max-width: 360px;
      border: 1px solid var(--gray-200);
    }
    .cred-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
    .cred-logo { font-size: 2rem; }
    .cred-inst { font-weight: 700; font-size: 0.95rem; }
    .cred-accred { font-size: 0.75rem; color: var(--gray-400); }
    .cred-header .badge { margin-left: auto; }
    .cred-divider { height: 1px; background: var(--gray-100); margin: 1rem 0; }
    .cred-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem; }
    .cred-field { font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.75rem; }
    .cred-name { font-size: 1.1rem; font-weight: 600; color: var(--primary); margin-bottom: 0.75rem; }
    .cred-meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--gray-400); margin-bottom: 1rem; }
    .cred-chain {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.7rem; color: var(--gray-400); background: var(--gray-50);
      padding: 6px 10px; border-radius: 8px;
    }

    /* Stats */
    .stats-bar {
      display: flex; justify-content: center; align-items: center; gap: 0;
      background: white; border-top: 1px solid var(--gray-200); border-bottom: 1px solid var(--gray-200);
      padding: 1.75rem 1.5rem;
    }
    .stat-item { text-align: center; padding: 0 3rem; }
    .stat-divider { width: 1px; height: 40px; background: var(--gray-200); }

    /* Features */
    .features { max-width: 1100px; margin: 0 auto; padding: 4rem 1.5rem; }
    .section-title { font-size: 1.75rem; font-weight: 800; text-align: center; margin-bottom: 2.5rem; }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
    .feature-card {
      background: white; border-radius: var(--radius); padding: 1.5rem;
      border: 1px solid var(--gray-200); transition: box-shadow .2s, transform .2s;
    }
    .feature-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
    .feature-icon { font-size: 1.75rem; margin-bottom: 0.75rem; }
    .feature-card h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem; }
    .feature-card p { font-size: 0.85rem; color: var(--gray-600); line-height: 1.6; }

    /* How it works */
    .how-it-works { background: var(--primary-light); padding: 4rem 1.5rem; }
    .how-it-works .section-title { color: var(--primary-dark); }
    .steps {
      display: flex; align-items: flex-start; gap: 0.5rem;
      max-width: 1100px; margin: 0 auto;
    }
    .step { flex: 1; background: white; border-radius: var(--radius); padding: 1.5rem; }
    .step-num {
      width: 36px; height: 36px; background: var(--primary); color: white;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 1rem; margin-bottom: 0.75rem;
    }
    .step h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem; }
    .step p { font-size: 0.82rem; color: var(--gray-600); line-height: 1.6; }
    .step-arrow { font-size: 1.5rem; color: var(--primary); padding-top: 1.5rem; flex-shrink: 0; }

    /* Footer */
    .footer { text-align: center; padding: 2.5rem 1.5rem; color: var(--gray-400); font-size: 0.85rem; }
    .footer a { color: var(--primary); }
    .footer-quote { margin-top: 0.5rem; font-style: italic; }

    @media (max-width: 768px) {
      .hero { grid-template-columns: 1fr; padding: 2rem 1rem; }
      .hero-visual { display: none; }
      h1 { font-size: 2rem; }
      .features-grid { grid-template-columns: 1fr; }
      .steps { flex-direction: column; }
      .step-arrow { display: none; }
      .stats-bar { flex-wrap: wrap; gap: 1.5rem; }
      .stat-divider { display: none; }
    }
  `],
})
export class HomeComponent {
  credId = '';
  constructor(private router: Router) {}
  verify() {
    if (this.credId.trim()) this.router.navigate(['/verify', this.credId.trim()]);
  }
}
