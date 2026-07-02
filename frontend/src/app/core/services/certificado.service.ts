import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CertificadoResponse {
  id: number;
  usuarioId: number;
  cursoId: number;
  codigo: string;
  archivoPdf: string;
  urlValidacion: string;
  numeroRegistro: string;
  fechaEmision: string;
}

@Injectable({
  providedIn: 'root'
})
export class CertificadoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/certificados';

  generarCertificado(cursoId: number): Observable<CertificadoResponse> {
    return this.http.post<CertificadoResponse>(`${this.apiUrl}/generar/${cursoId}`, null);
  }

  validarCertificado(codigo: string): Observable<CertificadoResponse> {
    return this.http.get<CertificadoResponse>(`${this.apiUrl}/validar/${codigo}`);
  }

  listarCertificados(search?: string): Observable<CertificadoResponse[]> {
    let url = this.apiUrl;
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }
    return this.http.get<CertificadoResponse[]>(url);
  }
}
