import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-issue',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatSnackBarModule,
  ],
  template: `
    <div class="issue-container">
      <h1>Issue Credential</h1>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline">
          <mat-label>Graduate Stellar Address</mat-label>
          <input matInput formControlName="graduatePublicKey" placeholder="G..." />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Graduate Name</mat-label>
          <input matInput formControlName="graduateName" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Graduate Email</mat-label>
          <input matInput formControlName="graduateEmail" type="email" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Credential Type</mat-label>
          <mat-select formControlName="credentialType">
            <mat-option value="BACHELORS">Bachelor's Degree</mat-option>
            <mat-option value="MASTERS">Master's Degree</mat-option>
            <mat-option value="PHD">PhD</mat-option>
            <mat-option value="DIPLOMA">Diploma</mat-option>
            <mat-option value="CERTIFICATE">Certificate</mat-option>
            <mat-option value="LICENSE">Professional License</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" placeholder="Bachelor of Science" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Field of Study</mat-label>
          <input matInput formControlName="fieldOfStudy" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Grade / Classification</mat-label>
          <input matInput formControlName="grade" placeholder="First Class Honours" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Issue Date</mat-label>
          <input matInput formControlName="issueDate" type="date" />
        </mat-form-field>

        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading()">
          {{ loading() ? 'Issuing...' : 'Issue on Stellar' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .issue-container { padding: 2rem; max-width: 600px; margin: 0 auto; }
    form { display: flex; flex-direction: column; gap: 1rem; }
    mat-form-field { width: 100%; }
  `],
})
export class IssueComponent {
  loading = signal(false);

  form = this.fb.group({
    graduatePublicKey: ['', Validators.required],
    graduateName: ['', Validators.required],
    graduateEmail: ['', Validators.email],
    credentialType: ['BACHELORS', Validators.required],
    title: ['', Validators.required],
    fieldOfStudy: ['', Validators.required],
    grade: ['', Validators.required],
    issueDate: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private http: HttpClient, private snack: MatSnackBar) {}

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.http
      .post(`${environment.apiUrl}/credentials`, this.form.value)
      .subscribe({
        next: () => {
          this.snack.open('Credential issued successfully!', 'Close', { duration: 4000 });
          this.form.reset();
          this.loading.set(false);
        },
        error: (e) => {
          this.snack.open(`Error: ${e.error?.message ?? e.message}`, 'Close', { duration: 5000 });
          this.loading.set(false);
        },
      });
  }
}
