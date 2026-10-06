package com.insteip.backend.domain.dto.diaacupuntura;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatriculaResultadoResponse {
    private Long usuarioId;
    private String correo;
    private String nombresCompletos;
    private String telefono;
    private String passwordAsignada;
    private List<DetalleMatriculaDto> matriculas;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetalleMatriculaDto {
        private Long matriculaId;
        private Long cursoId;
        private String cursoNombre;
    }
}
