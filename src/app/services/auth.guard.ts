import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './AuthService'; // Seu serviço de auth

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  
  if (authService.usuarioLogado()) {
    return true; 
  } else {
   
    router.navigate(['/login']);
    return false; 
  }
};