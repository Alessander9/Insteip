export interface AlumnoRequest {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  nivelSuscripcionId: number;
}

export interface AlumnoResponse {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  nivelSuscripcion: string;
  estado: boolean;
  fechaRegistro: string;
}
