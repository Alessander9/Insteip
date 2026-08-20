export interface NotificacionItem {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  urlDestino?: string;
  icono?: string;
  leido: boolean;
  fechaCreacion: string;
}

export interface NotificacionResumen {
  totalNoLeidas: number;
  notificaciones: NotificacionItem[];
}

export interface ComunicadoRequest {
  titulo: string;
  mensaje: string;
  urlDestino?: string;
  icono?: string;
  audiencia: 'TODOS' | 'SOLO_ESTUDIANTES' | 'SOLO_DOCENTES' | 'DOCENTES_Y_ESTUDIANTES' | 'POR_CURSO';
  cursoId?: number;
}
