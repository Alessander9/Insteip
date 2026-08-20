import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, switchMap, filter, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificacionResumen, ComunicadoRequest } from '../models/notificacion.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = `${environment.apiUrl}/notificaciones`;

  private resumenSubject = new BehaviorSubject<NotificacionResumen>({
    totalNoLeidas: 0,
    notificaciones: []
  });

  public resumen$ = this.resumenSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.iniciarPolling();
  }

  private iniciarPolling(): void {
    // Consulta inicial si está autenticado
    if (this.authService.isLoggedIn()) {
      this.cargarNotificaciones().subscribe();
    }

    // Polling ligero cada 45 segundos solo si está autenticado
    interval(45000).pipe(
      filter(() => this.authService.isLoggedIn()),
      switchMap(() => this.cargarNotificaciones())
    ).subscribe();
  }

  cargarNotificaciones(limite: number = 20): Observable<NotificacionResumen> {
    if (!this.authService.isLoggedIn()) {
      return of({ totalNoLeidas: 0, notificaciones: [] });
    }

    return new Observable(observer => {
      this.http.get<NotificacionResumen>(`${this.apiUrl}/mis-notificaciones?limite=${limite}`).subscribe({
        next: (resumen) => {
          this.resumenSubject.next(resumen);
          observer.next(resumen);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  marcarComoLeida(id: number): Observable<void> {
    return new Observable(observer => {
      this.http.patch<void>(`${this.apiUrl}/${id}/leer`, {}).subscribe({
        next: () => {
          // Actualización optimista local
          const actual = this.resumenSubject.value;
          const notificacionesActualizadas = actual.notificaciones.map(n => {
            if (n.id === id) {
              return { ...n, leido: true };
            }
            return n;
          });
          const nuevasNoLeidas = Math.max(0, actual.totalNoLeidas - 1);
          this.resumenSubject.next({
            totalNoLeidas: nuevasNoLeidas,
            notificaciones: notificacionesActualizadas
          });
          observer.next();
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  marcarTodasComoLeidas(): Observable<void> {
    return new Observable(observer => {
      this.http.patch<void>(`${this.apiUrl}/leer-todas`, {}).subscribe({
        next: () => {
          const actual = this.resumenSubject.value;
          const notificacionesActualizadas = actual.notificaciones.map(n => ({ ...n, leido: true }));
          this.resumenSubject.next({
            totalNoLeidas: 0,
            notificaciones: notificacionesActualizadas
          });
          observer.next();
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  enviarComunicado(comunicado: ComunicadoRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/comunicado`, comunicado);
  }
}
