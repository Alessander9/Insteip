package com.insteip.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AlumnoCursoResponse(
    Long id,
    String nombre,
    String descripcion,
    String imagenPortada,
    String nivelSuscripcion,
    BigDecimal avancePorcentaje,
    Boolean completado,
    LocalDateTime fechaMatricula
) {}
