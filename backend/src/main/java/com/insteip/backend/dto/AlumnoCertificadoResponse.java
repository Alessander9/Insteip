package com.insteip.backend.dto;

import java.time.LocalDateTime;

public record AlumnoCertificadoResponse(
    Long id,
    String codigo,
    String cursoNombre,
    LocalDateTime fechaEmision,
    String archivoPdf,
    String urlValidacion
) {}
