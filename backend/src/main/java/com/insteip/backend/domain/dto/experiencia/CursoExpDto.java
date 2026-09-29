package com.insteip.backend.domain.dto.experiencia;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursoExpDto {
    private Long id;
    private String nombre;
    private String descripcion;
    private String imagenPortada;
    private Boolean yaVisto;
    private List<ModuloExpDto> modulos;
}
