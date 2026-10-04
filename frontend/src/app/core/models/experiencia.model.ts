export type EstadoExperiencia = 'LIBRE' | 'BLOQUEADO' | 'AGOTADO';

export interface VerificarExpRequest {
  correo: string;
  cookieId?: string;
}

export interface VerificarExpResponse {
  estado: EstadoExperiencia;
  expiraEn?: string;
  cursosYaVistos?: number[];
  numeroUsoActual?: number;
  usosRestantes?: number;
  mensaje?: string;
}

export interface MaterialExp {
  id: number;
  nombre: string;
  tipo?: string;
  bloqueado: boolean;
  mensajeBloqueo: string;
}

export interface VideoExp {
  id: number;
  titulo: string;
  descripcion?: string;
  youtubeUrl: string;
  youtubeId?: string;
  duracionSegundos?: number;
  orden: number;
}

export interface ModuloExp {
  id: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  videos: VideoExp[];
  materiales: MaterialExp[];
}

export interface CursoExp {
  id: number;
  nombre: string;
  descripcion?: string;
  imagenPortada?: string;
  yaVisto?: boolean;
  modulos?: ModuloExp[];
}

export interface IniciarExpRequest {
  correo: string;
  cookieId?: string;
  cursosElegidos: number[];
}

export interface IniciarExpResponse {
  sessionToken: string;
  inicioSesion: string;
  expiraSesion: string;
  duracionSegundos: number;
  numeroUso: number;
  cursos: CursoExp[];
}

export interface ValidarSesionRequest {
  sessionToken: string;
}

export interface ValidarSesionResponse {
  valida: boolean;
  segundosRestantes?: number;
  expiraSesion?: string;
}

export interface SesionActivaExp {
  sessionToken: string;
  inicioSesion: string;
  expiraSesion: string;
  duracionSegundos: number;
  numeroUso: number;
  correo: string;
  cursos: CursoExp[];
}

export interface DemoCursoDto {
  id: number;
  nombre: string;
  descripcion?: string;
  imagenPortada?: string;
  nivelSuscripcion?: string;
  totalModulos: number;
  yaVisto: boolean;
}

export interface DemoCuentaDisponibleResponse {
  tokenTemporal: string;
  correoAsignado: string;
  cursos: DemoCursoDto[];
  todosCursosVistos: boolean;
  totalCursosDisponibles: number;
}

export interface DemoActivarRequest {
  cursoIds: number[];
}

export interface DemoActivarResponse {
  token: string;
  expiraEnSegundos: number;
  demoCursoIds: number[];
  correo: string;
}

