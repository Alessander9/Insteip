import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MaterialResponse } from '../models/material.model';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private http = inject(HttpClient);
  private baseApiUrl = environment.apiUrl + '';

  listarMaterialesPorModulo(moduloId: number): Observable<MaterialResponse[]> {
    return this.http.get<MaterialResponse[]>(`${this.baseApiUrl}/modulos/${moduloId}/materiales`);
  }

  subirMaterial(moduloId: number, nombre: string, archivo: File): Observable<MaterialResponse> {
    const formData = new FormData();
    formData.append('moduloId', moduloId.toString());
    formData.append('nombre', nombre);
    formData.append('archivo', archivo);
    return this.http.post<MaterialResponse>(`${this.baseApiUrl}/materiales`, formData);
  }

  editarMaterial(id: number, nombre: string, archivo?: File): Observable<MaterialResponse> {
    const formData = new FormData();
    formData.append('nombre', nombre);
    if (archivo) {
      formData.append('archivo', archivo);
    }
    return this.http.put<MaterialResponse>(`${this.baseApiUrl}/materiales/${id}`, formData);
  }

  cambiarEstado(id: number, estado: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseApiUrl}/materiales/${id}/estado`, { estado });
  }
}
