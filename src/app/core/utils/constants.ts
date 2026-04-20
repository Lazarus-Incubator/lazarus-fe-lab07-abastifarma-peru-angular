import { EstadoSolicitud, PrioridadSolicitud } from '../models/solicitud-reposicion.model';
import { EstadoProducto } from '../models/producto.model';
import { EstadoSede } from '../models/sede.model';
import { RolUsuario } from '../models/usuario.model';

export const API_BASE_URL = 'http://localhost:3000';
export const STORAGE_USER_KEY = 'abastifarma.currentUser';

export const ROL_LABELS: Record<RolUsuario, string> = {
  ADMIN: 'Administrador',
  OPERACIONES: 'Operaciones',
  ALMACEN: 'Almacén',
  BOTICA: 'Botica'
};

export const ESTADO_SOLICITUD_LABELS: Record<EstadoSolicitud, string> = {
  REGISTRADA: 'Registrada',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  ATENDIDA: 'Atendida'
};

export const PRIORIDAD_LABELS: Record<PrioridadSolicitud, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta'
};

export const ESTADO_SEDE_LABELS: Record<EstadoSede, string> = {
  ACTIVA: 'Activa',
  INACTIVA: 'Inactiva'
};

export const ESTADO_PRODUCTO_LABELS: Record<EstadoProducto, string> = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo'
};
