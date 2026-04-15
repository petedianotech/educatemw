import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthReady()) {
    if (authService.currentUser()) {
      return true;
    }
    return router.parseUrl('/login');
  }

  return toObservable(authService.isAuthReady).pipe(
    filter(isReady => isReady),
    take(1),
    map(() => {
      if (authService.currentUser()) {
        return true;
      }
      return router.parseUrl('/login');
    })
  );
};
