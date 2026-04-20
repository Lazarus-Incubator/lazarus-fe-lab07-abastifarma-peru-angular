import {
  EstadoSolicitud,
  SolicitudReposicion,
  SolicitudReposicionDetalle
} from '../models/solicitud-reposicion.model';
import { UsuarioSesion } from '../models/usuario.model';

export function canCreateSolicitud(user: UsuarioSesion | null): boolean {
  if (!user) {
    return false;
  }

  return user.rol === 'ADMIN' || user.rol === 'BOTICA';
}

export function canViewSedeFilter(user: UsuarioSesion | null): boolean {
  if (!user) {
    return false;
  }

  return user.rol !== 'BOTICA';
}

export function canApproveSolicitud(
  user: UsuarioSesion | null,
  solicitud: SolicitudReposicion | SolicitudReposicionDetalle | null
): boolean {
  // Se reutiliza el mismo criterio de acciones rapidas del modulo operativo
  // para no duplicar reglas mientras negocio termina de separar permisos finos.
  return (
    !!user &&
    !!solicitud &&
    (user.rol === 'OPERACIONES' || user.rol === 'ALMACEN') &&
    solicitud.estado === 'REGISTRADA'
  );
}

export function canRejectSolicitud(
  user: UsuarioSesion | null,
  solicitud: SolicitudReposicion | SolicitudReposicionDetalle | null
): boolean {
  return !!user && !!solicitud && user.rol === 'OPERACIONES' && solicitud.estado === 'REGISTRADA';
}

export function canAttendSolicitud(
  user: UsuarioSesion | null,
  solicitud: SolicitudReposicion | SolicitudReposicionDetalle | null
): boolean {
  // Pendiente alinear esta transicion con el flujo final cuando operaciones
  // confirme si los rechazos quedan disponibles solo para auditoria.
  return (
    !!user &&
    !!solicitud &&
    user.rol === 'ALMACEN' &&
    (solicitud.estado === 'APROBADA' || solicitud.estado === 'RECHAZADA')
  );
}

export function isValidStatusTransition(
  currentStatus: EstadoSolicitud,
  nextStatus: EstadoSolicitud
): boolean {
  if (currentStatus === 'REGISTRADA') {
    return nextStatus === 'APROBADA' || nextStatus === 'RECHAZADA';
  }

  if (currentStatus === 'APROBADA') {
    return nextStatus === 'ATENDIDA';
  }

  if (currentStatus === 'RECHAZADA') {
    return nextStatus === 'ATENDIDA';
  }

  return false;
}

export function filterSolicitudesByUser<T extends SolicitudReposicionDetalle | SolicitudReposicion>(
  solicitudes: T[],
  user: UsuarioSesion | null
): T[] {
  if (!user) {
    return [];
  }

  if (user.rol === 'BOTICA') {
    return solicitudes.filter((solicitud) => solicitud.sedeId === user.sedeId);
  }

  return solicitudes;
}
