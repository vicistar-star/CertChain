import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule,
    MatChipsModule, MatIconModule, MatSnackBarModule,
  ],
  template: `
    <div class="wallet-container">
      <h1>My Credentials</h1>

      @if (credentials().length === 0) {
        <p class="empty">No credentials yet. Share your Stellar address with your institution.</p>
      }

      <div class="credentials-grid">
        @for (cred of credentials(); track cred.id) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ cred.title }}</mat-card-title>
              <mat-card-subtitle>{{ cred.institution?.name }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>{{ cred.fieldOfStudy }} · {{ cred.grade }}</p>
              <p>Issued: {{ cred.issueDate | date }}</p>
              <mat-chip [highlighted]="cred.status === 'VALID'">{{ cred.status }}</mat-chip>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button (click)="copyShareLink(cred)">
                <mat-icon>share</mat-icon> Share
              </button>
              <a mat-button [href]="getVerifyUrl(cred)" target="_blank">
                <mat-icon>open_in_new</mat-icon> Verify
              </a>
            </mat-card-actions>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .wallet-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .credentials-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
    .empty { color: #6b7280; text-align: center; padding: 3rem; }
  `],
})
export class WalletComponent implements OnInit {
  credentials = signal<any[]>([]);

  constructor(private http: HttpClient, private snack: MatSnackBar) {}

  ngOnInit() {
    this.http
      .get<any[]>(`${environment.apiUrl}/graduates/me/credentials`)
      .subscribe((c) => this.credentials.set(c));
  }

  getVerifyUrl(cred: any): string {
    return `${environment.appUrl}/verify/${cred.stellarCredentialId}`;
  }

  copyShareLink(cred: any) {
    navigator.clipboard.writeText(this.getVerifyUrl(cred));
    this.snack.open('Share link copied!', 'Close', { duration: 2000 });
  }
}
