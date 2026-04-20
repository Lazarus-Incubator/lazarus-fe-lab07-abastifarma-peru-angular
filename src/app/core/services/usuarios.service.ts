import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Usuario } from '../models/usuario.model';
import { API_BASE_URL } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${API_BASE_URL}/usuarios`);
  }

  getById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${API_BASE_URL}/usuarios/${id}`);
  }
}
