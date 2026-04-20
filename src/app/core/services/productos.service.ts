import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Producto } from '../models/producto.model';
import { API_BASE_URL } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${API_BASE_URL}/productos`);
  }

  getActiveProducts(): Observable<Producto[]> {
    const params = new HttpParams().set('estado', 'ACTIVO');
    return this.http.get<Producto[]>(`${API_BASE_URL}/productos`, { params });
  }
}
