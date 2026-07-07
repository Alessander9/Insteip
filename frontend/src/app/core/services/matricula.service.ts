import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatriculaRequest, MatriculaResponse } from '../models/matricula.model';

@Injectable({
  providedIn: 'root'
})
export class MatriculaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/matriculas';

  matricularAlumno(request: MatriculaRequest): Observable<MatriculaResponse> {
    return this.http.post<MatriculaResponse>(this.apiUrl, request);
  }

  listarMatriculados(cursoId: number): Observable<MatriculaResponse[]> {
    return this.http.get<MatriculaResponse[]>(`${this.apiUrl}/curso/${cursoId}`);
  }

  cambiarEstado(id: number, estado: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, { estado });
  }
}
