package com.insteip.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursoDto {
    private Long id;
    private String nombre;
    private String descripcion;
    private String imagenPortada;
    private Boolean estado;
    private Long nivelSuscripcionId;
    private String nivelSuscripcionNombre;
}
