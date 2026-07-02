package com.insteip.backend.dto;

public record ModuloResponseDTO(
    Long id,
    String nombre,
    String descripcion,
    Integer orden,
    Boolean estado,
    Long cursoId,
    String cursoNombre
){}
