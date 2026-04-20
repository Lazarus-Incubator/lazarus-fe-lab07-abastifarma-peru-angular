import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, of, switchMap } from 'rxjs';

import { SolicitudReposicionDetalle } from '../../../../core/models/solicitud-reposicion.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SolicitudesService } from '../../../../core/services/solicitudes.service';
import {
  canApproveSolicitud,
  canAttendSolicitud,
  canRejectSolicitud
} from '../../../../core/utils/permissions.util';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-solicitud-detail-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingStateComponent
  ],
  templateUrl: './solicitud-detail-page.component.html',
  styleUrl: './solicitud-detail-page.component.css'
})
export class SolicitudDetailPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly solicitudesService = inject(SolicitudesService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentUser = this.authService.currentUser;
  readonly observationForm = this.fb.nonNullable.group({
    observation: ['']
  });

  solicitud: SolicitudReposicionDetalle | null = null;
  loading = true;
  actionLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadSolicitud();
  }

  get canApprove(): boolean {
    return canApproveSolicitud(this.currentUser, this.solicitud);
  }

  get canReject(): boolean {
    return canRejectSolicitud(this.currentUser, this.solicitud);
  }

  get canAttend(): boolean {
    return canAttendSolicitud(this.currentUser, this.solicitud);
  }

  goBack(): void {
    this.router.navigate(['/solicitudes'], {
      queryParams: this.route.snapshot.queryParams
    });
  }

  approve(): void {
    this.updateStatus('APROBADA');
  }

  reject(): void {
    this.updateStatus('RECHAZADA');
  }

  attend(): void {
    this.updateStatus('ATENDIDA');
  }

  private loadSolicitud(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.loading = true;
    this.errorMessage = '';

    this.solicitudesService
      .getDetailedById(id, this.currentUser)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (solicitud) => {
          this.solicitud = solicitud;
          this.observationForm.patchValue({
            observation: solicitud.observacionRespuesta ?? ''
          });
        },
        error: (error: Error) => {
          this.solicitud = null;
          this.errorMessage = error.message;
          this.notificationService.show(error.message, 'error');
        }
      });
  }

  private updateStatus(nextStatus: 'APROBADA' | 'RECHAZADA' | 'ATENDIDA'): void {
    if (!this.solicitud || !this.currentUser) {
      return;
    }

    this.actionLoading = true;
    const observation = this.buildObservation(nextStatus);

    this.solicitudesService
      .updateStatus(this.solicitud, nextStatus, this.currentUser.id, observation)
      .pipe(
        // De momento se refresca desde servidor solo cuando el flujo queda cerrado
        // desde almacen; para el resto se reutiliza el estado local del detalle.
        switchMap(() =>
          nextStatus === 'ATENDIDA'
            ? this.solicitudesService.getDetailedById(this.solicitud!.id, this.currentUser)
            : of(this.solicitud!)
        ),
        finalize(() => (this.actionLoading = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (solicitud) => {
          this.solicitud = solicitud;
          this.observationForm.patchValue({
            observation: solicitud.observacionRespuesta ?? ''
          });
          this.notificationService.show('Solicitud actualizada correctamente.', 'success');
        },
        error: (error: Error) => {
          this.notificationService.show(error.message, 'error');
          this.errorMessage = error.message;
        }
      });
  }

  private buildObservation(nextStatus: 'APROBADA' | 'RECHAZADA' | 'ATENDIDA'): string {
    const rawObservation = this.observationForm.getRawValue().observation.trim();

    if (rawObservation) {
      return rawObservation;
    }

    if (nextStatus === 'RECHAZADA') {
      return 'Solicitud rechazada por el área de Operaciones.';
    }

    if (nextStatus === 'APROBADA') {
      return 'Solicitud aprobada para atención logística.';
    }

    return 'Solicitud atendida por almacén.';
  }
}
