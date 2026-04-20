import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';

import { Usuario, UsuarioSesion } from '../models/usuario.model';
import { API_BASE_URL, STORAGE_USER_KEY } from '../utils/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly currentUserSubject = new BehaviorSubject<UsuarioSesion | null>(
    this.restoreStoredUser()
  );

  readonly currentUser$ = this.currentUserSubject.asObservable();

  get currentUser(): UsuarioSesion | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<UsuarioSesion> {
    const params = new HttpParams()
      .set('email', email.trim().toLowerCase())
      .set('password', password)
      .set('estado', 'ACTIVO');

    return this.http.get<Usuario[]>(`${API_BASE_URL}/usuarios`, { params }).pipe(
      map((users) => {
        const user = users[0];

        if (!user) {
          throw new Error('Credenciales inválidas o usuario inactivo.');
        }

        const sessionUser = this.toSessionUser(user);
        this.currentUserSubject.next(sessionUser);
        this.persistUser(sessionUser);

        return sessionUser;
      }),
      catchError((error: Error) =>
        throwError(() => new Error(error.message || 'No se pudo iniciar sesión.'))
      )
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(STORAGE_USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  hasAnyRole(roles: string[]): boolean {
    // BOTICA mantiene acceso de consulta en flujos donde el modulo todavia no
    // distingue del todo entre lectura y accion.
    return (
      !!this.currentUser &&
      (roles.includes(this.currentUser.rol) || this.currentUser.rol === 'BOTICA')
    );
  }

  private toSessionUser(user: Usuario): UsuarioSesion {
    const { password, ...sessionUser } = user;
    return sessionUser;
  }

  private persistUser(user: UsuarioSesion): void {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  }

  private restoreStoredUser(): UsuarioSesion | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const rawValue = localStorage.getItem(STORAGE_USER_KEY);

    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as UsuarioSesion;
    } catch {
      localStorage.removeItem(STORAGE_USER_KEY);
      return null;
    }
  }
}
