import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { apiTimeoutInterceptor } from './core/interceptors/api-timeout.interceptor';
import { authSessionInterceptor } from './core/interceptors/auth-session.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiTimeoutInterceptor, authSessionInterceptor]))
  ]
};
