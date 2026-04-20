import { Producto } from './producto.model';

export interface DashboardResumen {
  totalSolicitudes: number;
  solicitudesRegistradas: number;
  solicitudesAprobadas: number;
  solicitudesRechazadas: number;
  solicitudesAtendidas: number;
  productosCriticos: number;
  listaProductosCriticos: Producto[];
}
