package com.insteip.backend.domain.dto.matricula;

import java.time.LocalDateTime;

public record MaterialAccesoDTO(
    Long materialId,
    String nombre,
    String tipoArchivo,
    Long pesoBytes,
    Boolean habilitado,
    LocalDateTime fechaHabilitacion
) {}
