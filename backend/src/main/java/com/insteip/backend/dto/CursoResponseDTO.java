package com.insteip.backend.dto;

public record CursoResponseDTO(
    Long id,
    String nombre,
    String descripcion,
    String imagenPortada,
    java.util.List<String> nivelesSuscripcion,
    Boolean estado
){}
