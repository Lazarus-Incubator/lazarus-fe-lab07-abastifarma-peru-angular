export type EstadoProducto = 'ACTIVO' | 'INACTIVO';

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  estado: EstadoProducto;
}
