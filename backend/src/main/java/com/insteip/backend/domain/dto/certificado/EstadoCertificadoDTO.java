package com.insteip.backend.domain.dto.certificado;

public record EstadoCertificadoDTO(
    Long cursoId,
    String cursoNombre,
    double porcentajeProgreso,
    int videosCompletados,
    int totalVideos,
    boolean esDiaAcupuntura,
    double umbralRequerido,
    boolean requisitoCumplido,
    boolean tieneCertificadoSubido,
    Long certificadoId,
    String codigoCertificado,
    String urlDescarga
) {}
