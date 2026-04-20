import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { Producto } from '../../../../core/models/producto.model';
import { Sede } from '../../../../core/models/sede.model';
import { PrioridadSolicitud } from '../../../../core/models/solicitud-reposicion.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProductosService } from '../../../../core/services/productos.service';
import { SedesService } from '../../../../core/services/sedes.service';
import { SolicitudesService } from '../../../../core/services/solicitudes.service';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-solicitud-create-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PageHeaderComponent, LoadingStateComponent],
  templateUrl: './solicitud-create-page.component.html',
  styleUrl: './solicitud-create-page.component.css'
})
export class SolicitudCreatePageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly productosService = inject(ProductosService);
  private readonly sedesService = inject(SedesService);
  private readonly solicitudesService = inject(SolicitudesService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentUser = this.authService.currentUser;
  readonly priorityOptions: PrioridadSolicitud[] = ['BAJA', 'MEDIA', 'ALTA'];

  readonly form = this.fb.nonNullable.group({
    sedeId: ['', Validators.required],
    productoId: ['', Validators.required],
    cantidadSolicitada: [1, [Validators.required, Validators.min(1)]],
    prioridad: ['MEDIA' as PrioridadSolicitud, Validators.required],
    // Por ahora esta validacion se deja mas liviana en frontend
    // porque negocio todavia sigue ajustando los casos borde del motivo.
    motivo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(240)]]
  });

  sedes: Sede[] = [];
  productos: Producto[] = [];
  loading = true;
  saving = false;
  blockedMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      sedes: this.sedesService.getAll(),
      productos: this.productosService.getActiveProducts()
    })
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ sedes, productos }) => {
          this.productos = productos;
          this.configureSedes(sedes);
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.notificationService.show(error.message, 'error');
        }
      });
  }

  submit(): void {
    if (this.blockedMessage) {
      return;
    }

    if (this.form.invalid || !this.currentUser) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    const payload = this.form.getRawValue();

    this.solicitudesService
      .create({
        sedeId: Number(payload.sedeId),
        productoId: Number(payload.productoId),
        cantidadSolicitada: Number(payload.cantidadSolicitada),
        prioridad: payload.prioridad,
        motivo: payload.motivo,
        creadaPorUsuarioId: this.currentUser.id
      })
      .subscribe({
        next: (solicitud) => {
          this.saving = false;
          this.notificationService.show('Solicitud registrada correctamente.', 'success');
          this.router.navigate(['/solicitudes', solicitud.id]);
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.notificationService.show(error.message, 'error');
        }
      });
  }

  private configureSedes(sedes: Sede[]): void {
    const activeSedes = sedes.filter((sede) => sede.estado === 'ACTIVA');

    if (this.currentUser?.rol === 'BOTICA') {
      const assignedSede = sedes.find((sede) => sede.id === this.currentUser?.sedeId);

      if (!assignedSede || assignedSede.estado === 'INACTIVA') {
        this.blockedMessage =
          'Tu sede se encuentra inactiva y no puede registrar nuevas solicitudes.';
        this.form.disable();
        return;
      }

      this.sedes = [assignedSede];
      this.form.patchValue({ sedeId: String(assignedSede.id) });
      this.form.controls.sedeId.disable();
      return;
    }

    this.sedes = activeSedes;
  }
}
