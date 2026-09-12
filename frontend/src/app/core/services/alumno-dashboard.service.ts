import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface AlumnoMetrics {
  cursosInscritos: number;
  cursosCompletados: number;
  certificados: number;
}

export interface AlumnoCurso {
  id: number;
  nombre: string;
  descripcion: string;
  imagenPortada: string;
  nivelSuscripcion: string;
  avancePorcentaje: number;
  completado: boolean;
  fechaMatricula: string;
  fechaExpiracion?: string;
  diasRestantes?: number;
  alertaExpiracion?: 'OK' | 'PROXIMO_30_DIAS' | 'URGENTE_7_DIAS' | 'EXPIRADO';
}

export interface AlumnoCertificado {
  id: number;
  codigo: string;
  cursoNombre: string;
  fechaEmision: string;
  archivoPdf: string;
  urlValidacion: string;
}

export interface AlumnoPlayMaterial {
  id: number;
  nombre: string;
  archivoUrl: string;
  tipoArchivo: string;
  pesoBytes: number;
}

export interface AlumnoPlayVideo {
  id: number;
  titulo: string;
  descripcion: string;
  youtubeUrl: string;
  youtubeId: string;
  duracionSegundos: number;
  orden: number;
  ultimoSegundo: number;
  porcentajeVisto: number;
  completado: boolean;
}

export interface AlumnoPlayModulo {
  id: number;
  nombre: string;
  descripcion: string;
  orden: number;
  videos: AlumnoPlayVideo[];
  materiales: AlumnoPlayMaterial[];
  bloqueado?: boolean;
  mensajeBloqueo?: string;
}

export interface AlumnoPlayCourse {
  id: number;
  nombre: string;
  descripcion: string;
  imagenPortada: string;
  nivelSuscripcion: string;
  modulos: AlumnoPlayModulo[];
}

@Injectable({
  providedIn: 'root'
})
export class AlumnoDashboardService {
  private http = inject(HttpClient);
  private baseApiUrl = environment.apiUrl;

  private metricsCache$: Observable<AlumnoMetrics> | null = null;
  private enrolledCursosCache$: Observable<AlumnoCurso[]> | null = null;
  private certificadosCache$: Observable<AlumnoCertificado[]> | null = null;
  private lastMetricsFetch = 0;
  private lastCursosFetch = 0;
  private lastCertificadosFetch = 0;
  private readonly CACHE_TTL_MS = 60000; // 60 segundos de caché en memoria

  getMetrics(forceRefresh = false): Observable<AlumnoMetrics> {
    const now = Date.now();
    if (!forceRefresh && this.metricsCache$ && (now - this.lastMetricsFetch < this.CACHE_TTL_MS)) {
      return this.metricsCache$;
    }
    this.lastMetricsFetch = now;
    this.metricsCache$ = this.http.get<AlumnoMetrics>(`${this.baseApiUrl}/alumno/dashboard`).pipe(
      shareReplay({ bufferSize: 1, refCount: false })
    );
    return this.metricsCache$;
  }

  getEnrolledCursos(forceRefresh = false): Observable<AlumnoCurso[]> {
    const now = Date.now();
    if (!forceRefresh && this.enrolledCursosCache$ && (now - this.lastCursosFetch < this.CACHE_TTL_MS)) {
      return this.enrolledCursosCache$;
    }
    this.lastCursosFetch = now;
    this.enrolledCursosCache$ = this.http.get<AlumnoCurso[]>(`${this.baseApiUrl}/alumno/cursos`).pipe(
      shareReplay({ bufferSize: 1, refCount: false })
    );
    return this.enrolledCursosCache$;
  }

  getCertificados(forceRefresh = false): Observable<AlumnoCertificado[]> {
    const now = Date.now();
    if (!forceRefresh && this.certificadosCache$ && (now - this.lastCertificadosFetch < this.CACHE_TTL_MS)) {
      return this.certificadosCache$;
    }
    this.lastCertificadosFetch = now;
    this.certificadosCache$ = this.http.get<AlumnoCertificado[]>(`${this.baseApiUrl}/alumno/certificados`).pipe(
      shareReplay({ bufferSize: 1, refCount: false })
    );
    return this.certificadosCache$;
  }

  invalidateCache(): void {
    this.metricsCache$ = null;
    this.enrolledCursosCache$ = null;
    this.certificadosCache$ = null;
    this.lastMetricsFetch = 0;
    this.lastCursosFetch = 0;
    this.lastCertificadosFetch = 0;
  }

  getPlayCourse(cursoId: number): Observable<AlumnoPlayCourse> {
    return this.http.get<AlumnoPlayCourse>(`${this.baseApiUrl}/alumno/cursos/${cursoId}/play`);
  }

  guardarProgreso(videoId: number, ultimoSegundo: number, duracionSegundos?: number): Observable<any> {
    return this.http.post<any>(`${this.baseApiUrl}/avance`, { videoId, ultimoSegundo, duracionSegundos }).pipe(
      tap(() => this.invalidateCache())
    );
  }

  obtenerProgreso(videoId: number): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/avance/video/${videoId}`);
  }
}
