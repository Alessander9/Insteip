package com.insteip.backend.domain.dto.alumno;

import java.math.BigDecimal;

public record AlumnoPlayVideo(
    Long id,
    String titulo,
    String descripcion,
    String youtubeUrl,
    String youtubeId,
    Integer duracionSegundos,
    Integer orden,
    Integer ultimoSegundo,
    BigDecimal porcentajeVisto,
    Boolean completado,
    Boolean bloqueado,
    String mensajeBloqueo
) {
    public AlumnoPlayVideo(
        Long id,
        String titulo,
        String descripcion,
        String youtubeUrl,
        String youtubeId,
        Integer duracionSegundos,
        Integer orden,
        Integer ultimoSegundo,
        BigDecimal porcentajeVisto,
        Boolean completado
    ) {
        this(id, titulo, descripcion, youtubeUrl, youtubeId, duracionSegundos, orden, ultimoSegundo, porcentajeVisto, completado, false, null);
    }
}
