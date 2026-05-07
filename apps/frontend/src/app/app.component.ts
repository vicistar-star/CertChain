import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <div class="nav-inner">
        <a routerLink="/" class="nav-brand">
          <span class="brand-icon">🎓</span>
          <span class="brand-text">CertChain <span class="brand-africa">Africa</span></span>
        </a>

        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
          @if (auth.isLoggedIn() && auth.getRole() === 'INSTITUTION') {
            <a routerLink="/institution/dashboard" routerLinkActive="active">Dashboard</a>
            <a routerLink="/institution/issue" routerLinkActive="active">Issue</a>
            <a routerLink="/institution/manage" routerLinkActive="active">Manage</a>
          }
          @if (auth.isLoggedIn() && auth.getRole() === 'GRADUATE') {
            <a routerLink="/graduate/wallet" routerLinkActive="active">My Credentials</a>
          }
        </div>

        <div class="nav-actions">
          @if (!auth.isLoggedIn()) {
            <a routerLink="/auth/login" class="btn-nav">Connect Wallet</a>
          } @else {
            <span class="nav-role">{{ auth.getRole() }}</span>
            <button class="btn-nav btn-outline" (click)="auth.logout()">Logout</button>
          }
        </div>
      </div>
    </nav>

    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .navbar {
      background: white;
      border-bottom: 1px solid var(--gray-200);
      position: sticky; top: 0; z-index: 100;
    }
    .nav-inner {
      max-width: 1100px; margin: 0 auto;
      padding: 0 1.5rem; height: 64px;
      display: flex; align-items: center; gap: 2rem;
    }
    .nav-brand {
      display: flex; align-items: center; gap: 0.5rem;
      font-weight: 800; font-size: 1.1rem; color: var(--gray-900);
      white-space: nowrap;
    }
    .brand-icon { font-size: 1.4rem; }
    .brand-africa { color: var(--primary); }
    .nav-links {
      display: flex; gap: 0.25rem; flex: 1;
    }
    .nav-links a {
      padding: 0.4rem 0.85rem; border-radius: 8px;
      font-size: 0.9rem; font-weight: 500; color: var(--gray-600);
      transition: all .15s;
    }
    .nav-links a:hover, .nav-links a.active {
      background: var(--primary-light); color: var(--primary);
    }
    .nav-actions { display: flex; align-items: center; gap: 0.75rem; margin-left: auto; }
    .nav-role {
      font-size: 0.75rem; font-weight: 600; padding: 3px 10px;
      background: var(--primary-light); color: var(--primary); border-radius: 999px;
    }
    .btn-nav {
      padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.875rem;
      font-weight: 600; background: var(--primary); color: white; border: none;
      cursor: pointer; transition: background .15s;
    }
    .btn-nav:hover { background: var(--primary-dark); }
    .btn-outline { background: white; color: var(--gray-600); border: 1px solid var(--gray-200); }
    .btn-outline:hover { background: var(--gray-100); }
    main { min-height: calc(100vh - 64px); }
  `],
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
