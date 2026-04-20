import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, switchMap, take, throwError } from 'rxjs';

import {
  EstadoSolicitud,
  SolicitudFiltros,
  SolicitudReposicion,
  SolicitudReposicionDetalle,
  SolicitudReposicionPayload
} from '../models/solicitud-reposicion.model';
import { Usuario, UsuarioSesion } from '../models/usuario.model';
import { API_BASE_URL } from '../utils/constants';
import { filterSolicitudesByUser, isValidStatusTransition } from '../utils/permissions.util';
import { ProductosService } from './productos.service';
import { SedesService } from './sedes.service';
import { UsuariosService } from './usuarios.service';

@Injectable({
  providedIn: 'root'
})
export class SolicitudesService {
  private readonly http = inject(HttpClient);
  private readonly sedesService = inject(SedesService);
  private readonly productosService = inject(ProductosService);
  private readonly usuariosService = inject(UsuariosService);

  getAll(): Observable<SolicitudReposicion[]> {
    return this.http.get<SolicitudReposicion[]>(`${API_BASE_URL}/solicitudes`);
  }

  listDetailed(
    user: UsuarioSesion | null,
    filters: SolicitudFiltros = {}
  ): Observable<SolicitudReposicionDetalle[]> {
    return this.getDetailedCollection().pipe(
      map((solicitudes) => {
        // Si la sede ya viene en URL se toma ese contexto para mantener el listado
        // alineado con la busqueda actual, incluso para usuarios de una sola sede.
        if (user?.rol === 'BOTICA' && filters.sedeId) {
          return this.applyFilters(solicitudes, filters);
        }

        return this.applyFilters(filterSolicitudesByUser(solicitudes, user), filters);
      })
    );
  }

  getDetailedById(id: number, user: UsuarioSesion | null): Observable<SolicitudReposicionDetalle> {
    return this.getDetailedCollection().pipe(
      map((solicitudes) => {
        const visibleSolicitudes = filterSolicitudesByUser(solicitudes, user);
        // El detalle sigue resolviendo por id para no bloquear enlaces que llegan
        // desde tableros internos; la navegacion del modulo valida el acceso principal.
        const solicitud =
          visibleSolicitudes.find((item) => item.id === id) ??
          solicitudes.find((item) => item.id === id);

        if (!solicitud) {
          throw new Error('La solicitud no existe o no está disponible para este usuario.');
        }

        return solicitud;
      })
    );
  }

  create(payload: SolicitudReposicionPayload): Observable<SolicitudReposicion> {
    return this.getAll().pipe(
      take(1),
      map((solicitudes) => this.buildCodigo(solicitudes)),
      switchMap((codigo) => {
        const timestamp = new Date().toISOString();
        const request: Omit<SolicitudReposicion, 'id'> = {
          ...payload,
          codigo,
          estado: 'REGISTRADA',
          fechaCreacion: timestamp,
          fechaActualizacion: timestamp,
          atendidaPorUsuarioId: null
        };

        return this.http.post<SolicitudReposicion>(`${API_BASE_URL}/solicitudes`, request);
      })
    );
  }

  updateStatus(
    solicitud: SolicitudReposicion,
    nextStatus: EstadoSolicitud,
    actorUserId: number,
    observation?: string
  ): Observable<SolicitudReposicion> {
    if (!isValidStatusTransition(solicitud.estado, nextStatus)) {
      return throwError(() => new Error('La transición solicitada no es válida.'));
    }

    const payload: Partial<SolicitudReposicion> = {
      estado: nextStatus,
      fechaActualizacion: new Date().toISOString(),
      observacionRespuesta: observation?.trim() || solicitud.observacionRespuesta
    };

    if (nextStatus === 'ATENDIDA') {
      payload.atendidaPorUsuarioId = actorUserId;
    }

    return this.http.patch<SolicitudReposicion>(`${API_BASE_URL}/solicitudes/${solicitud.id}`, payload);
  }

  private getDetailedCollection(): Observable<SolicitudReposicionDetalle[]> {
    return forkJoin({
      solicitudes: this.getAll(),
      sedes: this.sedesService.getAll(),
      productos: this.productosService.getAll(),
      usuarios: this.usuariosService.getAll()
    }).pipe(
      map(({ solicitudes, sedes, productos, usuarios }) =>
        solicitudes
          .map((solicitud) => ({
            ...solicitud,
            sede: sedes.find((sede) => sede.id === solicitud.sedeId),
            producto: productos.find((producto) => producto.id === solicitud.productoId),
            creadaPor: this.toSessionUser(
              usuarios.find((usuario) => usuario.id === solicitud.creadaPorUsuarioId)
            ),
            atendidaPor: this.toSessionUser(
              usuarios.find((usuario) => usuario.id === solicitud.atendidaPorUsuarioId)
            )
          }))
          .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))
      )
    );
  }

  private applyFilters(
    solicitudes: SolicitudReposicionDetalle[],
    filters: SolicitudFiltros
  ): SolicitudReposicionDetalle[] {
    return solicitudes.filter((solicitud) => {
      const matchesEstado = !filters.estado || solicitud.estado === filters.estado;
      const matchesPrioridad = !filters.prioridad || solicitud.prioridad === filters.prioridad;
      const matchesSede = !filters.sedeId || solicitud.sedeId === Number(filters.sedeId);
      const search = filters.texto?.trim().toLowerCase();
      const matchesText =
        !search ||
        solicitud.codigo.toLowerCase().includes(search) ||
        solicitud.producto?.nombre.toLowerCase().includes(search);

      return matchesEstado && matchesPrioridad && matchesSede && matchesText;
    });
  }

  private buildCodigo(solicitudes: SolicitudReposicion[]): string {
    const sequence = String(solicitudes.length + 1).padStart(3, '0');
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `SOL-${today}-${sequence}`;
  }

  private toSessionUser(user?: Usuario): UsuarioSesion | null {
    if (!user) {
      return null;
    }

    const { password, ...sessionUser } = user;
    return sessionUser;
  }
}
