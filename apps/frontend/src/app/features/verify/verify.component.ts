import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

interface VerificationResult {
  credentialId: string;
  isValid: boolean;
  status: string;
  credential: { type: string; title: string; fieldOfStudy: string; grade: string; issueDate: string; expiryDate: string | null; };
  institution: { name: string; country: string; accreditationBody: string; stellarAddress: string; };
  graduate: { stellarAddress: string; name: string; };
  verificationCount: number;
  revokedAt: { ledger: number; reason: string } | null;
  verifiedAt: string;
}

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="verify-page">

      @if (loading()) {
        <div class="loading-screen">
          <div class="spinner-lg"></div>
          <p>Querying Stellar blockchain...</p>
          <span>Connecting to Soroban RPC</span>
        </div>
      }

      @if (result()) {
        <div class="result-wrap">
          <!-- Status banner -->
          <div class="status-banner" [class.status-valid]="result()!.isValid" [class.status-invalid]="!result()!.isValid">
            <div class="status-icon">{{ result()!.isValid ? '✓' : '✗' }}</div>
            <div class="status-text">
              <div class="status-title">{{ result()!.isValid ? 'Credential Verified' : result()!.status }}</div>
              <div class="status-sub">{{ result()!.isValid ? 'This credential exists on the Stellar blockchain and is valid' : 'This credential has been ' + result()!.status.toLowerCase() }}</div>
            </div>
            <div class="status-chain">
              <div class="chain-dot"></div>
              Stellar Mainnet
            </div>
          </div>

          <div class="result-body">
            <!-- Left: credential details -->
            <div class="result-main">
              <div class="cred-card">
                <div class="cred-type-badge">{{ result()!.credential.type }}</div>
                <h1 class="cred-title">{{ result()!.credential.title }}</h1>
                <div class="cred-holder">
                  <span class="holder-label">Awarded to</span>
                  <span class="holder-name">{{ result()!.graduate.name }}</span>
                </div>

                <div class="detail-grid">
                  <div class="detail-item">
                    <div class="detail-label">Field of Study</div>
                    <div class="detail-value">{{ result()!.credential.fieldOfStudy }}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Grade / Classification</div>
                    <div class="detail-value">{{ result()!.credential.grade }}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Issue Date</div>
                    <div class="detail-value">{{ result()!.credential.issueDate | date:'longDate' }}</div>
                  </div>
                  @if (result()!.credential.expiryDate) {
                    <div class="detail-item">
                      <div class="detail-label">Expiry Date</div>
                      <div class="detail-value">{{ result()!.credential.expiryDate | date:'longDate' }}</div>
                    </div>
                  }
                </div>

                @if (result()!.revokedAt) {
                  <div class="revoke-notice">
                    <span>⚠️</span>
                    <div>
                      <strong>Revoked at ledger {{ result()!.revokedAt!.ledger }}</strong>
                      <div>{{ result()!.revokedAt!.reason }}</div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Right: institution + meta -->
            <div class="result-side">
              <div class="inst-card">
                <div class="inst-header">Issuing Institution</div>
                <div class="inst-name">{{ result()!.institution.name }}</div>
                <div class="inst-meta">
                  <div class="inst-row">
                    <span class="inst-key">Country</span>
                    <span>{{ result()!.institution.country }}</span>
                  </div>
                  <div class="inst-row">
                    <span class="inst-key">Accreditation</span>
                    <span>{{ result()!.institution.accreditationBody }}</span>
                  </div>
                  <div class="inst-row">
                    <span class="inst-key">Stellar Address</span>
                    <span class="mono">{{ result()!.institution.stellarAddress | slice:0:8 }}...{{ result()!.institution.stellarAddress | slice:-6 }}</span>
                  </div>
                </div>
              </div>

              <div class="meta-card">
                <div class="meta-row">
                  <span>Credential ID</span>
                  <strong>#{{ result()!.credentialId }}</strong>
                </div>
                <div class="meta-row">
                  <span>Verified</span>
                  <strong>{{ result()!.verificationCount }} times</strong>
                </div>
                <div class="meta-row">
                  <span>Checked at</span>
                  <strong>{{ result()!.verifiedAt | date:'medium' }}</strong>
                </div>
              </div>

              <button class="btn-share" (click)="copyLink()">
                {{ copied ? '✓ Copied!' : '🔗 Copy verification link' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (error()) {
        <div class="error-screen">
          <div class="error-icon">🔍</div>
          <h2>Credential not found</h2>
          <p>No credential with ID <strong>#{{ credentialId() }}</strong> exists on the Stellar blockchain.</p>
          <a routerLink="/" class="btn-back">← Try another ID</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .verify-page { max-width: 1000px; margin: 0 auto; padding: 2rem 1.5rem; }

    .loading-screen {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 50vh; gap: 1rem; color: var(--gray-600);
    }
    .spinner-lg {
      width: 48px; height: 48px; border: 3px solid var(--gray-200);
      border-top-color: var(--primary); border-radius: 50%;
      animation: spin .8s linear infinite;
    }
    .loading-screen p { font-size: 1.1rem; font-weight: 600; color: var(--gray-800); }
    .loading-screen span { font-size: 0.85rem; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Status banner */
    .status-banner {
      display: flex; align-items: center; gap: 1.25rem;
      padding: 1.25rem 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;
    }
    .status-valid { background: #d1fae5; border: 1px solid #6ee7b7; }
    .status-invalid { background: #fee2e2; border: 1px solid #fca5a5; }
    .status-icon {
      width: 44px; height: 44px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 800;
      flex-shrink: 0;
    }
    .status-valid .status-icon { background: #10b981; color: white; }
    .status-invalid .status-icon { background: #ef4444; color: white; }
    .status-title { font-weight: 700; font-size: 1rem; }
    .status-sub { font-size: 0.82rem; color: var(--gray-600); margin-top: 2px; }
    .status-chain {
      margin-left: auto; display: flex; align-items: center; gap: 6px;
      font-size: 0.8rem; font-weight: 600; color: var(--gray-600);
    }
    .chain-dot {
      width: 8px; height: 8px; background: #10b981; border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

    /* Result layout */
    .result-body { display: grid; grid-template-columns: 1fr 320px; gap: 1.25rem; }

    .cred-card {
      background: white; border-radius: 16px; padding: 2rem;
      border: 1px solid var(--gray-200); box-shadow: var(--shadow);
    }
    .cred-type-badge {
      display: inline-block; background: var(--primary-light); color: var(--primary);
      font-size: 0.75rem; font-weight: 700; padding: 3px 10px; border-radius: 999px;
      margin-bottom: 0.75rem; letter-spacing: .05em;
    }
    .cred-title { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.75rem; }
    .cred-holder { margin-bottom: 1.5rem; }
    .holder-label { display: block; font-size: 0.75rem; color: var(--gray-400); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 2px; }
    .holder-name { font-size: 1.25rem; font-weight: 700; color: var(--primary); }

    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .detail-label { font-size: 0.75rem; color: var(--gray-400); text-transform: uppercase; letter-spacing: .04em; margin-bottom: 3px; }
    .detail-value { font-weight: 600; font-size: 0.95rem; }

    .revoke-notice {
      display: flex; gap: 0.75rem; align-items: flex-start;
      background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px;
      padding: 1rem; margin-top: 1.5rem; font-size: 0.875rem; color: #991b1b;
    }

    /* Side cards */
    .inst-card, .meta-card {
      background: white; border-radius: 12px; padding: 1.25rem;
      border: 1px solid var(--gray-200); margin-bottom: 0.75rem;
    }
    .inst-header { font-size: 0.7rem; text-transform: uppercase; letter-spacing: .06em; color: var(--gray-400); margin-bottom: 0.5rem; }
    .inst-name { font-weight: 700; font-size: 1rem; margin-bottom: 0.75rem; }
    .inst-row { display: flex; justify-content: space-between; font-size: 0.82rem; padding: 0.35rem 0; border-bottom: 1px solid var(--gray-100); }
    .inst-row:last-child { border-bottom: none; }
    .inst-key { color: var(--gray-400); }
    .mono { font-family: monospace; font-size: 0.8rem; }

    .meta-row { display: flex; justify-content: space-between; font-size: 0.82rem; padding: 0.4rem 0; border-bottom: 1px solid var(--gray-100); }
    .meta-row:last-child { border-bottom: none; }
    .meta-row span { color: var(--gray-400); }

    .btn-share {
      width: 100%; padding: 0.75rem; background: var(--primary); color: white;
      border: none; border-radius: 10px; font-size: 0.875rem; font-weight: 600;
      cursor: pointer; transition: background .15s;
    }
    .btn-share:hover { background: var(--primary-dark); }

    /* Error */
    .error-screen {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 50vh; gap: 1rem; text-align: center;
    }
    .error-icon { font-size: 3rem; }
    .error-screen h2 { font-size: 1.5rem; font-weight: 800; }
    .error-screen p { color: var(--gray-600); }
    .btn-back {
      margin-top: 0.5rem; padding: 0.6rem 1.5rem; background: var(--primary);
      color: white; border-radius: 10px; font-weight: 600; font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .result-body { grid-template-columns: 1fr; }
      .detail-grid { grid-template-columns: 1fr; }
      .status-chain { display: none; }
    }
  `],
})
export class VerifyComponent implements OnInit {
  credentialId = signal('');
  loading = signal(true);
  result = signal<VerificationResult | null>(null);
  error = signal<string | null>(null);
  copied = false;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loading.set(false); return; }
    this.credentialId.set(id);
    this.http
      .get<VerificationResult>(`${environment.apiUrl}/verification/${id}`)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({ next: (r) => this.result.set(r), error: (e) => this.error.set(e.message) });
  }

  copyLink() {
    navigator.clipboard.writeText(window.location.href);
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }
}
