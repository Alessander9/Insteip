package com.insteip.backend.dto;

public record AlumnoPlayMaterial(
    Long id,
    String nombre,
    String archivoUrl,
    String tipoArchivo,
    Long pesoBytes
) {}
