import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TallerEvento, MatriculaLoteEventoRequest, ResumenInscritosEvento, ActualizarVideoTallerRequest, MatriculaResultadoResponse } from '../models/dia-acupuntura.model';

@Injectable({
  providedIn: 'root'
})
export class DiaAcupunturaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/dia-acupuntura';

  listarTalleres(): Observable<TallerEvento[]> {
    return this.http.get<TallerEvento[]>(`${this.apiUrl}/talleres`);
  }

  obtenerResumenInscritos(): Observable<ResumenInscritosEvento[]> {
    return this.http.get<ResumenInscritosEvento[]>(`${this.apiUrl}/admin/resumen`);
  }

  matricularLote(solicitudes: MatriculaLoteEventoRequest[]): Observable<MatriculaResultadoResponse[]> {
    return this.http.post<MatriculaResultadoResponse[]>(`${this.apiUrl}/admin/matricular-lote`, solicitudes);
  }

  matricularIndividual(solicitud: MatriculaLoteEventoRequest): Observable<MatriculaResultadoResponse> {
    return this.http.post<MatriculaResultadoResponse>(`${this.apiUrl}/admin/matricular-individual`, solicitud);
  }

  agregarVideoTaller(cursoId: number, req: ActualizarVideoTallerRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/admin/talleres/${cursoId}/videos`, req);
  }

  actualizarVideoTaller(cursoId: number, videoId: number, req: ActualizarVideoTallerRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/admin/talleres/${cursoId}/videos/${videoId}`, req);
  }

  eliminarVideoTaller(cursoId: number, videoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/talleres/${cursoId}/videos/${videoId}`);
  }
}
