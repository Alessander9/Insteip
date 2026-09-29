package com.insteip.backend.domain.dto.experiencia;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IniciarExpResponse {
    private String sessionToken;
    private LocalDateTime inicioSesion;
    private LocalDateTime expiraSesion; // fecha actual + 15 minutos
    private Integer duracionSegundos;   // 900 (15 min)
    private Integer numeroUso;          // 1, 2 o 3
    private List<CursoExpDto> cursos;   // Los 2 cursos seleccionados con sus módulos y videos
}
