export interface MatriculaRequest {
  usuarioId: number;
  cursoId: number;
}

export interface MatriculaResponse {
  id: number;
  usuarioId: number;
  alumnoNombres: string;
  alumnoApellidos: string;
  alumnoCorreo: string;
  cursoId: number;
  cursoNombre: string;
  fechaMatricula: string;
  estado: boolean;
}
