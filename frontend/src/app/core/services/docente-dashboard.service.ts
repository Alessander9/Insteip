import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DocenteCurso {
  id: number;
  nombre: string;
  descripcion: string;
  imagenPortada: string;
  nivelesSuscripcion: string[];
  estado: boolean;
  docenteId: number | null;
  docenteNombre: string | null;
  fechaCreacion: string;
}

export interface DocenteEstudianteProgress {
  estudianteId: number;
  nombres: string;
  apellidos: string;
  correo: string;
  porcentajeAvance: number;
  completado: boolean;
  fechaActualizacion: string;
  matriculaId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocenteDashboardService {
  private http = inject(HttpClient);
  private baseApiUrl = environment.apiUrl;

  private cursosCache$: Observable<DocenteCurso[]> | null = null;
  private lastFetch = 0;
  private readonly CACHE_TTL_MS = 60000;

  getCursosAsignados(forceRefresh = false): Observable<DocenteCurso[]> {
    const now = Date.now();
    if (!forceRefresh && this.cursosCache$ && (now - this.lastFetch < this.CACHE_TTL_MS)) {
      return this.cursosCache$;
    }
    this.lastFetch = now;
    this.cursosCache$ = this.http.get<DocenteCurso[]>(`${this.baseApiUrl}/docente/cursos`).pipe(
      shareReplay({ bufferSize: 1, refCount: false })
    );
    return this.cursosCache$;
  }

  getAlumnosCurso(cursoId: number): Observable<DocenteEstudianteProgress[]> {
    return this.http.get<DocenteEstudianteProgress[]>(`${this.baseApiUrl}/docente/cursos/${cursoId}/alumnos`);
  }

  invalidateCache(): void {
    this.cursosCache$ = null;
    this.lastFetch = 0;
  }
}
