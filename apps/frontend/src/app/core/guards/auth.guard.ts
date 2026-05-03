import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isLoggedIn()) return true;
    this.router.navigate(['/auth/login']);
    return false;
  }
}

export function RoleGuard(role: string) {
  @Injectable({ providedIn: 'root' })
  class Guard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) {}
    canActivate(): boolean {
      if (this.auth.getRole() === role) return true;
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
  return Guard;
}
