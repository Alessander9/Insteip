export interface VideoEvento {
  id: number;
  titulo: string;
  youtubeUrl: string;
  youtubeId: string;
  duracionMinutos: number;
  orden: number;
}

export interface MaterialEvento {
  id: number;
  nombre: string;
  archivoUrl: string;
  tipoArchivo: string;
}

export interface TallerEvento {
  id: number;
  nombre: string;
  descripcion: string;
  imagenPortada: string;
  docente: string;
  duracionMinutos: number;
  inscrito: boolean;
  matriculaId?: number;
  orden: number;
  moduloId?: number;
  videos: VideoEvento[];
  materiales: MaterialEvento[];
}

export interface ActualizarVideoTallerRequest {
  youtubeUrl: string;
  titulo?: string;
  duracionMinutos?: number;
}

export interface MatriculaLoteEventoRequest {
  correo: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  password?: string;
  cursosIds: number[];
}

export interface AlumnoInscritoEvento {
  usuarioId: number;
  nombresCompletos: string;
  correo: string;
  telefono?: string;
  matriculaId: number;
  estado: boolean;
}

export interface ResumenInscritosEvento {
  cursoId: number;
  cursoNombre: string;
  totalInscritos: number;
  alumnos: AlumnoInscritoEvento[];
}

export interface DetalleMatriculaDto {
  matriculaId: number;
  cursoId: number;
  cursoNombre: string;
}

export interface MatriculaResultadoResponse {
  usuarioId: number;
  correo: string;
  nombresCompletos: string;
  telefono?: string;
  passwordAsignada?: string;
  matriculas: DetalleMatriculaDto[];
}

