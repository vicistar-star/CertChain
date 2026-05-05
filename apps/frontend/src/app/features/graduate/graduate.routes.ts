import { Routes } from '@angular/router';

export const graduateRoutes: Routes = [
  {
    path: 'wallet',
    loadComponent: () =>
      import('./wallet/wallet.component').then((m) => m.WalletComponent),
  },
  { path: '', redirectTo: 'wallet', pathMatch: 'full' },
];
