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
public class VerificarExpResponse {

    /**
     * Estado del visitante:
     * - LIBRE: Puede elegir cursos y comenzar.
     * - BLOQUEADO: Está dentro de la semana de bloqueo (se muestra countdown / fecha).
     * - AGOTADO: Ya usó sus 3 accesos gratuitos.
     */
    private String estado;

    private LocalDateTime expiraEn;

    private List<Long> cursosYaVistos;

    private Integer numeroUsoActual;

    private Integer usosRestantes;

    private String mensaje;
}
