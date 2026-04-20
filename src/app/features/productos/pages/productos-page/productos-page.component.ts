import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { Producto } from '../../../../core/models/producto.model';
import { ProductosService } from '../../../../core/services/productos.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-productos-page',
  imports: [
    CommonModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './productos-page.component.html',
  styleUrl: './productos-page.component.css'
})
export class ProductosPageComponent implements OnInit {
  private readonly productosService = inject(ProductosService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  productos: Producto[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.productosService
      .getAll()
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (productos) => {
          this.productos = productos;
        },
        error: (error: Error) => {
          this.productos = [];
          this.errorMessage = error.message;
          this.notificationService.show(error.message, 'error');
        }
      });
  }

  isCritical(producto: Producto): boolean {
    return producto.estado === 'ACTIVO' && producto.stockActual <= producto.stockMinimo;
  }
}
