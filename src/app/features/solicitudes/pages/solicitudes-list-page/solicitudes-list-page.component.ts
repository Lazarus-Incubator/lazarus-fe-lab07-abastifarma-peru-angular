import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, of, switchMap, tap } from 'rxjs';

import { Sede } from '../../../../core/models/sede.model';
import {
  EstadoSolicitud,
  PrioridadSolicitud,
  SolicitudFiltros,
  SolicitudReposicionDetalle
} from '../../../../core/models/solicitud-reposicion.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SedesService } from '../../../../core/services/sedes.service';
import { SolicitudesService } from '../../../../core/services/solicitudes.service';
import { cleanQueryParams } from '../../../../core/utils/query-params.util';
import {
  canCreateSolicitud,
  canViewSedeFilter
} from '../../../../core/utils/permissions.util';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-solicitudes-list-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './solicitudes-list-page.component.html',
  styleUrl: './solicitudes-list-page.component.css'
})
export class SolicitudesListPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly sedesService = inject(SedesService);
  private readonly solicitudesService = inject(SolicitudesService);
  private readonly notificationService = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentUser = this.authService.currentUser;
  readonly canCreate = canCreateSolicitud(this.currentUser);
  readonly showSedeFilter = canViewSedeFilter(this.currentUser);

  readonly estadoOptions: EstadoSolicitud[] = ['REGISTRADA', 'APROBADA', 'RECHAZADA', 'ATENDIDA'];
  readonly prioridadOptions: PrioridadSolicitud[] = ['BAJA', 'MEDIA', 'ALTA'];

  readonly filtersForm = this.fb.group({
    estado: [''],
    prioridad: [''],
    sedeId: [''],
    texto: ['']
  });

  sedes: Sede[] = [];
  solicitudes: SolicitudReposicionDetalle[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.sedesService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (sedes) => {
          this.sedes = sedes;
        },
        error: (error: Error) => {
          this.notificationService.show(error.message, 'error');
        }
      });

    this.route.queryParamMap
      .pipe(
        map((params) => this.readFiltersFromQuery(params)),
        tap((filters) => {
          this.filtersForm.patchValue(
            {
              estado: filters.estado ?? '',
              prioridad: filters.prioridad ?? '',
              sedeId: filters.sedeId ? String(filters.sedeId) : '',
              texto: filters.texto ?? ''
            },
            { emitEvent: false }
          );
          this.loading = true;
          this.errorMessage = '';
        }),
        switchMap((filters) =>
          this.solicitudesService.listDetailed(this.currentUser, filters).pipe(
            catchError((error: Error) => {
              this.errorMessage = error.message;
              this.notificationService.show(error.message, 'error');
              return of([]);
            }),
            finalize(() => {
              this.loading = false;
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((solicitudes) => {
        this.solicitudes = solicitudes;
      });
  }

  applyFilters(): void {
    const { estado, prioridad, sedeId, texto } = this.filtersForm.getRawValue();
    const queryParams = cleanQueryParams({
      estado,
      prioridad,
      sedeId,
      texto
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }

  clearFilters(): void {
    this.filtersForm.reset({
      estado: '',
      prioridad: '',
      sedeId: '',
      texto: ''
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  openDetail(solicitud: SolicitudReposicionDetalle): void {
    const { estado, prioridad, sedeId } = this.filtersForm.getRawValue();

    // Se preservan filtros operativos principales; el texto libre no siempre
    // se persiste porque antes generaba urls demasiado ruidosas para soporte.
    this.router.navigate([solicitud.id], {
      relativeTo: this.route,
      queryParams: cleanQueryParams({
        estado,
        prioridad,
        sedeId
      })
    });
  }

  private readFiltersFromQuery(params: { get: (name: string) => string | null }): SolicitudFiltros {
    return {
      estado: (params.get('estado') as EstadoSolicitud | null) ?? '',
      prioridad: (params.get('priority') as PrioridadSolicitud | null) ?? '',
      sedeId: params.get('sedeId') ? Number(params.get('sedeId')) : null,
      texto: params.get('q') ?? ''
    };
  }
}
