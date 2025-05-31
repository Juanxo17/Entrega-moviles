import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStateService } from '../services/auth-state.service';
import { map, take } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const authStateService = inject(AuthStateService);
  const router = inject(Router);
  
  return authStateService.currentUser.pipe(
    take(1),
    map(user => {
      const isAdmin = user?.rol === 'ADMIN';
      
      if (isAdmin) {
        return true;
      }
      
      // Redirigir a una página de acceso denegado o al inicio
      router.navigate(['/tabs/tab1']);
      return false;
    })
  );
};
