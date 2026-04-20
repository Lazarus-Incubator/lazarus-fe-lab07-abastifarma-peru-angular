import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { canCreateSolicitud } from '../../../core/utils/permissions.util';
import { RoleLabelPipe } from '../../pipes/role-label.pipe';

@Component({
  selector: 'app-shell',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, RoleLabelPipe],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css'
})
export class AppShellComponent {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  readonly currentUser$ = this.authService.currentUser$;
  readonly notification$ = this.notificationService.notification$;

  canCreateRequest(): boolean {
    return canCreateSolicitud(this.authService.currentUser);
  }

  logout(): void {
    this.authService.logout();
    this.notificationService.show('Sesión cerrada correctamente.', 'info');
    this.router.navigate(['/login']);
  }
}
