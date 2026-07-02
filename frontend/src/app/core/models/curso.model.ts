export interface CursoRequest {
  nombre: string;
  descripcion: string;
  imagenPortada: string;
  nivelesSuscripcionIds: number[];
}

export interface CursoResponse {
  id: number;
  nombre: string;
  descripcion: string;
  imagenPortada: string;
  nivelesSuscripcion: string[];
  estado: boolean;
}
