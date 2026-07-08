export interface VideoRequest {
  moduloId: number;
  titulo: string;
  descripcion: string;
  youtubeUrl: string;
  orden: number;
}

export interface VideoResponse {
  id: number;
  titulo: string;
  descripcion: string;
  youtubeUrl: string;
  orden: number;
  estado: boolean;
  fechaCreacion: string;
}
