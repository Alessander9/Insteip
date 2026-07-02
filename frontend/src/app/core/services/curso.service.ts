import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CursoRequest, CursoResponse } from '../models/curso.model';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/cursos';

  listarCursos(): Observable<CursoResponse[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => Array.isArray(res) ? res : (res && res.content ? res.content : []))
    );
  }

  obtenerCurso(id: number): Observable<CursoResponse> {
    return this.http.get<CursoResponse>(`${this.apiUrl}/${id}`);
  }

  crearCurso(curso: CursoRequest): Observable<CursoResponse> {
    return this.http.post<CursoResponse>(this.apiUrl, curso);
  }

  editarCurso(id: number, curso: CursoRequest): Observable<CursoResponse> {
    return this.http.put<CursoResponse>(`${this.apiUrl}/${id}`, curso);
  }

  cambiarEstado(id: number, estado: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, { estado });
  }
}
