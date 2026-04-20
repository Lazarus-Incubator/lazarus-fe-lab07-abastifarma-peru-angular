import { Producto } from './producto.model';
import { Sede } from './sede.model';
import { UsuarioSesion } from './usuario.model';

export type PrioridadSolicitud = 'BAJA' | 'MEDIA' | 'ALTA';
export type EstadoSolicitud = 'REGISTRADA' | 'APROBADA' | 'RECHAZADA' | 'ATENDIDA';

export interface SolicitudReposicion {
  id: number;
  codigo: string;
  sedeId: number;
  productoId: number;
  cantidadSolicitada: number;
  motivo: string;
  prioridad: PrioridadSolicitud;
  estado: EstadoSolicitud;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadaPorUsuarioId: number;
  observacionRespuesta?: string;
  atendidaPorUsuarioId?: number | null;
}

export interface SolicitudReposicionPayload {
  sedeId: number;
  productoId: number;
  cantidadSolicitada: number;
  motivo: string;
  prioridad: PrioridadSolicitud;
  creadaPorUsuarioId: number;
}

export interface SolicitudFiltros {
  estado?: EstadoSolicitud | '';
  prioridad?: PrioridadSolicitud | '';
  sedeId?: number | null;
  texto?: string;
}

export interface SolicitudReposicionDetalle extends SolicitudReposicion {
  sede?: Sede;
  producto?: Producto;
  creadaPor?: UsuarioSesion | null;
  atendidaPor?: UsuarioSesion | null;
}
