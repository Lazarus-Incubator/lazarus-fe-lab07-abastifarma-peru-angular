import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { DashboardResumen } from '../models/dashboard.model';
import { UsuarioSesion } from '../models/usuario.model';
import { filterSolicitudesByUser } from '../utils/permissions.util';
import { ProductosService } from './productos.service';
import { SolicitudesService } from './solicitudes.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly solicitudesService = inject(SolicitudesService);
  private readonly productosService = inject(ProductosService);

  getResumen(user: UsuarioSesion | null): Observable<DashboardResumen> {
    return forkJoin({
      solicitudes: this.solicitudesService.getAll(),
      productos: this.productosService.getAll()
    }).pipe(
      map(({ solicitudes, productos }) => {
        const visibleSolicitudes = filterSolicitudesByUser(solicitudes, user);
        const criticalProducts = productos.filter(
          (producto) => producto.estado === 'ACTIVO' && producto.stockActual <= producto.stockMinimo
        );

        return {
          totalSolicitudes: visibleSolicitudes.length,
          solicitudesRegistradas: visibleSolicitudes.filter((item) => item.estado === 'REGISTRADA').length,
          solicitudesAprobadas: visibleSolicitudes.filter((item) => item.estado === 'APROBADA').length,
          solicitudesRechazadas: visibleSolicitudes.filter((item) => item.estado === 'RECHAZADA').length,
          solicitudesAtendidas: visibleSolicitudes.filter((item) => item.estado === 'ATENDIDA').length,
          productosCriticos: criticalProducts.length,
          listaProductosCriticos: criticalProducts
        };
      }),
    );
  }
}
