import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  VerificarExpRequest,
  VerificarExpResponse,
  CursoExp,
  IniciarExpRequest,
  IniciarExpResponse,
  ValidarSesionRequest,
  ValidarSesionResponse,
  SesionActivaExp
} from '../models/experiencia.model';

@Injectable({
  providedIn: 'root'
})
export class ExperienciaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/experiencias';

  private readonly COOKIE_NAME = 'insteip_vid';
  private readonly SESSION_KEY = 'insteip_exp_session';

  /**
   * Obtiene o genera una cookie persistente (UUID v4) de 30 días para identificar el navegador.
   */
  getOrCreateCookieId(): string {
    if (typeof document === 'undefined') {
      return '';
    }

    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const trimmed = c.trim();
      if (trimmed.startsWith(this.COOKIE_NAME + '=')) {
        return trimmed.substring(this.COOKIE_NAME.length + 1);
      }
    }

    // Generar nuevo UUID si no existe
    const nuevoId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'vid_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

    const maxAge = 30 * 24 * 60 * 60; // 30 días en segundos
    document.cookie = `${this.COOKIE_NAME}=${nuevoId}; max-age=${maxAge}; path=/; SameSite=Lax`;
    return nuevoId;
  }

  /**
   * Consulta al backend el estado del visitante (LIBRE, BLOQUEADO o AGOTADO).
   */
  verificarEstado(correo: string): Observable<VerificarExpResponse> {
    const cookieId = this.getOrCreateCookieId();
    const payload: VerificarExpRequest = {
      correo: correo.trim().toLowerCase(),
      cookieId
    };
    return this.http.post<VerificarExpResponse>(`${this.apiUrl}/verificar`, payload);
  }

  /**
   * Lista todos los cursos activos, marcando los ya explorados según el historial del visitante.
   */
  listarCursos(correo?: string): Observable<CursoExp[]> {
    const cookieId = this.getOrCreateCookieId();
    const params: Record<string, string> = {
      cookieId
    };
    if (correo && correo.trim()) {
      params['correo'] = correo.trim().toLowerCase();
    }
    return this.http.get<CursoExp[]>(`${this.apiUrl}/cursos`, { params });
  }

  /**
   * Inicia los 15 minutos de la experiencia y obtiene los 2 cursos completos.
   */
  iniciarExperiencia(correo: string, cursosElegidos: number[]): Observable<IniciarExpResponse> {
    const cookieId = this.getOrCreateCookieId();
    const payload: IniciarExpRequest = {
      correo: correo.trim().toLowerCase(),
      cookieId,
      cursosElegidos
    };
    return this.http.post<IniciarExpResponse>(`${this.apiUrl}/iniciar`, payload);
  }

  /**
   * Valida en el backend la vigencia del token de sesión de 15 min.
   */
  validarSesion(sessionToken: string): Observable<ValidarSesionResponse> {
    const payload: ValidarSesionRequest = { sessionToken };
    return this.http.post<ValidarSesionResponse>(`${this.apiUrl}/validar-sesion`, payload);
  }

  /**
   * Guarda los datos de la sesión activa en sessionStorage.
   */
  guardarSesion(sesion: SesionActivaExp): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sesion));
    }
  }

  /**
   * Obtiene la sesión activa desde sessionStorage si existe.
   */
  getSesionActual(): SesionActivaExp | null {
    if (typeof sessionStorage === 'undefined') return null;
    const raw = sessionStorage.getItem(this.SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SesionActivaExp;
    } catch {
      return null;
    }
  }

  /**
   * Limpia la sesión activa de sessionStorage.
   */
  limpiarSesion(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this.SESSION_KEY);
    }
  }
}
