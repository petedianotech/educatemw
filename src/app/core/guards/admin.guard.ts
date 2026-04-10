import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (user && (user.email === 'petedianotech@gmail.com' || user.email === 'mscepreparation@gmail.com' || user.role === 'admin')) {
    return true;
  }
  return router.parseUrl('/');
};
