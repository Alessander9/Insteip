import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CursoRequest, CursoResponse } from '../models/curso.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/cursos';

  listarCursos(page = 0, size = 10, search = '', sort = 'fechaCreacion,desc'): Observable<any> {
    return this.http.get<any>(this.apiUrl, {
      params: {
        page: String(page),
        size: String(size),
        ...(search.trim() ? { search: search.trim() } : {}),
        sort
      }
    }).pipe(
      map(res => Array.isArray(res)
        ? { content: res, totalElements: res.length, totalPages: 1, number: page, size }
        : res)
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
