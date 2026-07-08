package com.insteip.backend.dto;

public record VideoResponseDTO(
    Long id,
    String titulo,
    String descripcion,
    String youtubeUrl,
    Integer orden,
    Boolean estado,
    java.time.LocalDateTime fechaCreacion
){}
