import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterModule],
  template: `
    <div class="dashboard">
      <h1>Institution Dashboard</h1>

      @if (stats()) {
        <div class="stats-grid">
          <mat-card>
            <mat-card-content>
              <div class="stat-value">{{ stats()!.stats.total }}</div>
              <div class="stat-label">Total Issued</div>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <div class="stat-value">{{ stats()!.stats.valid }}</div>
              <div class="stat-label">Active</div>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <div class="stat-value">{{ stats()!.stats.revoked }}</div>
              <div class="stat-label">Revoked</div>
            </mat-card-content>
          </mat-card>
        </div>
      }

      <div class="actions">
        <a mat-raised-button color="primary" routerLink="/institution/issue">Issue Credential</a>
        <a mat-stroked-button routerLink="/institution/manage">Manage Credentials</a>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1.5rem 0; }
    .stat-value { font-size: 2.5rem; font-weight: 700; }
    .stat-label { color: #6b7280; font-size: 0.875rem; }
    .actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
  `],
})
export class DashboardComponent implements OnInit {
  stats = signal<any>(null);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http
      .get(`${environment.apiUrl}/institutions/me/stats`)
      .subscribe((s) => this.stats.set(s));
  }
}
