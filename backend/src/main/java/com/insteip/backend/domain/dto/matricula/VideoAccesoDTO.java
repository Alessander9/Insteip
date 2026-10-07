package com.insteip.backend.domain.dto.matricula;

import java.time.LocalDateTime;

public record VideoAccesoDTO(
    Long videoId,
    String titulo,
    Integer orden,
    Integer duracionSegundos,
    Boolean habilitado,
    LocalDateTime fechaHabilitacion
) {}
