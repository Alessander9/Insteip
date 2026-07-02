import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlumnoRequest, AlumnoResponse } from '../models/alumno.model';

@Injectable({
  providedIn: 'root'
})
export class AlumnoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/usuarios';

  listarAlumnos(): Observable<AlumnoResponse[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => Array.isArray(res) ? res : (res && res.content ? res.content : []))
    );
  }

  obtenerAlumno(id: number): Observable<AlumnoResponse> {
    return this.http.get<AlumnoResponse>(`${this.apiUrl}/${id}`);
  }

  crearAlumno(alumno: AlumnoRequest): Observable<AlumnoResponse> {
    return this.http.post<AlumnoResponse>(this.apiUrl, alumno);
  }

  editarAlumno(id: number, alumno: AlumnoRequest): Observable<AlumnoResponse> {
    return this.http.put<AlumnoResponse>(`${this.apiUrl}/${id}`, alumno);
  }

  cambiarEstado(id: number, estado: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, { estado });
  }
}
