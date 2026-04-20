export type EstadoSede = 'ACTIVA' | 'INACTIVA';

export interface Sede {
  id: number;
  nombre: string;
  ciudad: string;
  codigo: string;
  estado: EstadoSede;
}
