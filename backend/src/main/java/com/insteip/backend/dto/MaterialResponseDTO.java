package com.insteip.backend.dto;

public record MaterialResponseDTO(
    Long id,
    String nombre,
    String archivoUrl,
    String tipoArchivo,
    Long pesoBytes,
    Boolean estado
){}
