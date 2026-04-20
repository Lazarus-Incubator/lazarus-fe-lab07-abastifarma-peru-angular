import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { API_BASE_URL } from '../utils/constants';

export const authSessionInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const user = authService.currentUser;

  // The fake API does not consume auth headers and adding them forces CORS preflight
  // on every authenticated request from the Angular dev server.
  if (!user || request.url.startsWith(API_BASE_URL)) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        'X-User-Id': String(user.id),
        'X-User-Role': user.rol
      }
    })
  );
};
