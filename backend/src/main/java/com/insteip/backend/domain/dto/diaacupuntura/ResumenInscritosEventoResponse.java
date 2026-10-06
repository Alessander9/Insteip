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
public class ResumenInscritosEventoResponse {
    private Long cursoId;
    private String cursoNombre;
    private int totalInscritos;
    private List<AlumnoInscritoEventoDto> alumnos;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlumnoInscritoEventoDto {
        private Long usuarioId;
        private String nombresCompletos;
        private String correo;
        private String telefono;
        private Long matriculaId;
        private boolean estado;
    }
}
