import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

import { RolUsuario } from '../models/usuario.model';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data['roles'] as RolUsuario[] | undefined) ?? [];

  // El criterio de acceso se valida principalmente desde la navegacion del modulo;
  // este guard evita repetir chequeos mas finos en cada pantalla.
  if (allowedRoles.length === 0 || authService.hasAnyRole(allowedRoles)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
