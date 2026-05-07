import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'verify/:id',
    loadComponent: () =>
      import('./features/verify/verify.component').then((m) => m.VerifyComponent),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'institution',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/institution/institution.routes').then((m) => m.institutionRoutes),
  },
  {
    path: 'graduate',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/graduate/graduate.routes').then((m) => m.graduateRoutes),
  },
  { path: '**', redirectTo: '' },
];
