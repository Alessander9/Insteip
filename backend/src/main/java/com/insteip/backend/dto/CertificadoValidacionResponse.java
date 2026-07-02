package com.insteip.backend.dto;

import java.time.LocalDate;

public record CertificadoValidacionResponse(
    Boolean valido,
    String alumno,
    String curso,
    LocalDate fechaEmision,
    String codigo
) {}
