import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface DocenteOption {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/usuarios';

  listarDocentes(search = ''): Observable<DocenteOption[]> {
    let params = new HttpParams();
    if (search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<DocenteOption[] | { content: DocenteOption[] }>(`${this.apiUrl}/docentes`, { params }).pipe(
      map(res => Array.isArray(res) ? res : (res && 'content' in res ? res.content : []))
    );
  }
}
