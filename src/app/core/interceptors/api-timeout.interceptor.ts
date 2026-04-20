import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { TimeoutError, catchError, throwError, timeout } from 'rxjs';

import { API_BASE_URL } from '../utils/constants';

const API_REQUEST_TIMEOUT_MS = 8000;

export const apiTimeoutInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(API_BASE_URL)) {
    return next(request);
  }

  return next(request).pipe(
    timeout(API_REQUEST_TIMEOUT_MS),
    catchError((error: unknown) => {
      if (error instanceof TimeoutError) {
        return throwError(
          () =>
            new Error(
              'La fake API demoró demasiado en responder. Verifica que JSON Server siga activo en el puerto 3000.'
            )
        );
      }

      if (error instanceof HttpErrorResponse) {
        const message =
          error.error?.message ||
          `La fake API respondió con error (${error.status || 'sin estado'}).`;

        return throwError(() => new Error(message));
      }

      return throwError(() =>
        error instanceof Error ? error : new Error('Ocurrió un error inesperado al consultar la fake API.')
      );
    })
  );
};
