package com.insteip.backend.dto;

import java.time.LocalDateTime;

public record CertificadoResponseDTO(
    Long id,
    Long usuarioId,
    Long cursoId,
    String codigo,
    String archivoPdf,
    String urlValidacion,
    String numeroRegistro,
    LocalDateTime fechaEmision
) {}
