export type RolUsuario = 'ADMIN' | 'OPERACIONES' | 'ALMACEN' | 'BOTICA';
export type EstadoUsuario = 'ACTIVO' | 'INACTIVO';

export interface Usuario {
  id: number;
  nombreCompleto: string;
  email: string;
  password: string;
  rol: RolUsuario;
  sedeId?: number | null;
  estado: EstadoUsuario;
}

export type UsuarioSesion = Omit<Usuario, 'password'>;
