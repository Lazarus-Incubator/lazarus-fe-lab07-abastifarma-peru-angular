import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Sede } from '../models/sede.model';
import { API_BASE_URL } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class SedesService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Sede[]> {
    return this.http.get<Sede[]>(`${API_BASE_URL}/sedes`);
  }

  getById(id: number): Observable<Sede> {
    return this.http.get<Sede>(`${API_BASE_URL}/sedes/${id}`);
  }
}
