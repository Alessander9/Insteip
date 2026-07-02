import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfiguracionRequest, ConfiguracionResponse } from '../models/configuracion.model';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/configuracion';

  obtenerConfiguracion(): Observable<ConfiguracionResponse> {
    return this.http.get<ConfiguracionResponse>(this.apiUrl);
  }

  actualizarConfiguracion(config: ConfiguracionRequest): Observable<ConfiguracionResponse> {
    return this.http.put<ConfiguracionResponse>(this.apiUrl, config);
  }
}
