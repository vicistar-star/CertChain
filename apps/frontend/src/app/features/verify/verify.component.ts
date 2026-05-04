import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

interface VerificationResult {
  credentialId: string;
  isValid: boolean;
  status: string;
  credential: {
    type: string;
    title: string;
    fieldOfStudy: string;
    grade: string;
    issueDate: string;
    expiryDate: string | null;
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
  verifiedAt: string;
}

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  template: `
    <div class="verify-container">
      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Querying Stellar blockchain...</p>
        </div>
      }

      @if (result()) {
        <mat-card [class.valid-card]="result()!.isValid" [class.invalid-card]="!result()!.isValid">
          <mat-card-header>
            <mat-icon mat-card-avatar>
              {{ result()!.isValid ? 'verified' : 'cancel' }}
            </mat-icon>
            <mat-card-title>{{ result()!.credential.title }}</mat-card-title>
            <mat-card-subtitle>{{ result()!.graduate.name }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="status-chip">
              <mat-chip [highlighted]="result()!.isValid">
                {{ result()!.isValid ? '✓ Verified on Stellar' : '✗ ' + result()!.status }}
              </mat-chip>
            </div>

            <div class="meta-grid">
              <div class="meta-item">
                <label>Institution</label>
                <span>{{ result()!.institution.name }}</span>
              </div>
              <div class="meta-item">
                <label>Country</label>
                <span>{{ result()!.institution.country }}</span>
              </div>
              <div class="meta-item">
                <label>Accreditation</label>
                <span>{{ result()!.institution.accreditationBody }}</span>
              </div>
              <div class="meta-item">
                <label>Field of Study</label>
                <span>{{ result()!.credential.fieldOfStudy }}</span>
              </div>
              <div class="meta-item">
                <label>Grade</label>
                <span>{{ result()!.credential.grade }}</span>
              </div>
              <div class="meta-item">
                <label>Issue Date</label>
                <span>{{ result()!.credential.issueDate | date: 'longDate' }}</span>
              </div>
            </div>

            @if (result()!.revokedAt) {
              <div class="revocation-notice">
                <mat-icon>warning</mat-icon>
                <span>Revoked at ledger {{ result()!.revokedAt!.ledger }}: {{ result()!.revokedAt!.reason }}</span>
              </div>
            }

            <p class="chain-info">
              Credential #{{ credentialId() }} · Verified {{ result()!.verificationCount }} times
            </p>
          </mat-card-content>
        </mat-card>
      }

      @if (error()) {
        <mat-card class="error-card">
          <mat-card-content>
            <mat-icon>error_outline</mat-icon>
            <h2>Credential not found</h2>
            <p>This ID does not exist on the Stellar blockchain.</p>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .verify-container { max-width: 640px; margin: 2rem auto; padding: 1rem; }
    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 3rem; }
    .valid-card { border-left: 4px solid #22c55e; }
    .invalid-card { border-left: 4px solid #ef4444; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
    .meta-item label { display: block; font-size: 0.75rem; color: #6b7280; text-transform: uppercase; }
    .meta-item span { font-weight: 500; }
    .chain-info { font-size: 0.75rem; color: #9ca3af; margin-top: 1rem; }
    .revocation-notice { display: flex; align-items: center; gap: 0.5rem; color: #ef4444; background: #fef2f2; padding: 0.75rem; border-radius: 0.5rem; }
    .status-chip { margin: 0.5rem 0; }
  `],
})
export class VerifyComponent implements OnInit {
  credentialId = signal('');
  loading = signal(true);
  result = signal<VerificationResult | null>(null);
  error = signal<string | null>(null);

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.credentialId.set(id);
    this.http
      .get<VerificationResult>(`${environment.apiUrl}/verification/${id}`)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (r) => this.result.set(r),
        error: (e) => this.error.set(e.message),
      });
  }
}
