package com.insteip.backend.dto;

import java.math.BigDecimal;

public record AlumnoCursoResponse(
    Long id,
    String nombre,
    String descripcion,
    String imagenPortada,
    String nivelSuscripcion,
    BigDecimal avancePorcentaje,
    Boolean completado
) {}
