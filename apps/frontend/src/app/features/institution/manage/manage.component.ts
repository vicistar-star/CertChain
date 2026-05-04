import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-manage',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule,
    MatChipsModule, MatDialogModule, MatSnackBarModule,
  ],
  template: `
    <div class="manage-container">
      <h1>Manage Credentials</h1>

      <table mat-table [dataSource]="credentials()" class="mat-elevation-z2">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Graduate</th>
          <td mat-cell *matCellDef="let c">{{ c.graduateName }}</td>
        </ng-container>
        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef>Credential</th>
          <td mat-cell *matCellDef="let c">{{ c.title }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let c">
            <mat-chip [highlighted]="c.status === 'VALID'">{{ c.status }}</mat-chip>
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let c">
            @if (c.status === 'VALID') {
              <button mat-stroked-button color="warn" (click)="revoke(c)">Revoke</button>
            }
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .manage-container { padding: 2rem; }
    table { width: 100%; }
  `],
})
export class ManageComponent implements OnInit {
  credentials = signal<any[]>([]);
  columns = ['name', 'title', 'status', 'actions'];

  constructor(private http: HttpClient, private snack: MatSnackBar) {}

  ngOnInit() {
    this.http
      .get<any[]>(`${environment.apiUrl}/credentials`)
      .subscribe((c) => this.credentials.set(c));
  }

  revoke(credential: any) {
    const reason = prompt('Revocation reason:');
    if (!reason) return;
    this.http
      .delete(`${environment.apiUrl}/credentials/${credential.stellarCredentialId}`, {
        body: { reason },
      })
      .subscribe({
        next: () => {
          this.snack.open('Credential revoked', 'Close', { duration: 3000 });
          this.ngOnInit();
        },
        error: (e) => this.snack.open(`Error: ${e.message}`, 'Close', { duration: 4000 }),
      });
  }
}
