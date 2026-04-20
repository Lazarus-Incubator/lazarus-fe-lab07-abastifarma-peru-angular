import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { publicOnlyGuard } from './core/guards/public-only.guard';
import { roleGuard } from './core/guards/role.guard';
import { AppShellComponent } from './shared/components/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page.component').then(
        (m) => m.LoginPageComponent
      )
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page.component').then(
            (m) => m.DashboardPageComponent
          )
      },
      {
        path: 'solicitudes',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './features/solicitudes/pages/solicitudes-list-page/solicitudes-list-page.component'
              ).then((m) => m.SolicitudesListPageComponent)
          },
          {
            path: 'nueva',
            canActivate: [roleGuard],
            data: {
              roles: ['ADMIN', 'BOTICA']
            },
            loadComponent: () =>
              import(
                './features/solicitudes/pages/solicitud-create-page/solicitud-create-page.component'
              ).then((m) => m.SolicitudCreatePageComponent)
          },
          {
            path: ':id',
            canActivate: [roleGuard],
            data: {
              roles: ['ADMIN', 'OPERACIONES', 'ALMACEN']
            },
            loadComponent: () =>
              import(
                './features/solicitudes/pages/solicitud-detail-page/solicitud-detail-page.component'
              ).then((m) => m.SolicitudDetailPageComponent)
          }
        ]
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/productos/pages/productos-page/productos-page.component').then(
            (m) => m.ProductosPageComponent
          )
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/perfil/pages/profile-page/profile-page.component').then(
            (m) => m.ProfilePageComponent
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
