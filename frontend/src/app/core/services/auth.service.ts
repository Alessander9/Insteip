import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, throwError } from 'rxjs';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';
import { UserProfile } from '../models/user-profile.model';
import { TokenRefreshRequest, TokenRefreshResponse } from '../models/token-refresh.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/auth';

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(res => {
        if (res && res.token) {
          this.saveToken(res.token);
        }
        if (res && res.refreshToken) {
          this.saveRefreshToken(res.refreshToken);
        }
        if (res && res.rol) {
          this.saveUserRole(res.rol);
        }
      })
    );
  }

  refreshToken(): Observable<TokenRefreshResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: TokenRefreshRequest = { refreshToken };
    return this.http.post<TokenRefreshResponse>(`${this.apiUrl}/refresh`, request).pipe(
      tap(res => {
        if (res?.token) {
          this.saveToken(res.token);
        }
        if (res?.refreshToken) {
          this.saveRefreshToken(res.refreshToken);
        }
      })
    );
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
  }

  logoutRemote(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return of(void 0);
    }

    return this.http.post<void>(`${this.apiUrl}/logout`, { refreshToken }).pipe(
      tap(() => this.logout())
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  saveRefreshToken(refreshToken: string): void {
    localStorage.setItem('refreshToken', refreshToken);
  }

  saveUserRole(role: string): void {
    localStorage.setItem('userRole', role);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  forgotPassword(correo: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { correo });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { token, newPassword });
  }
}
