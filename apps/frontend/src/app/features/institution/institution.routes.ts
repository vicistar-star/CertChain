import { Routes } from '@angular/router';

export const institutionRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'issue',
    loadComponent: () =>
      import('./issue/issue.component').then((m) => m.IssueComponent),
  },
  {
    path: 'manage',
    loadComponent: () =>
      import('./manage/manage.component').then((m) => m.ManageComponent),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
