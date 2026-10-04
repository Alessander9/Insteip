package com.insteip.backend.domain.dto.demo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemoCursoDto {
    private Long id;
    private String nombre;
    private String descripcion;
    private String imagenPortada;
    private String nivelSuscripcion;
    private int totalModulos;
    private boolean yaVisto;
}
