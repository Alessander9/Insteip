package com.insteip.backend.domain.dto.alumno;

public record AlumnoPlayMaterial(
    Long id,
    String nombre,
    String archivoUrl,
    String tipoArchivo,
    Long pesoBytes,
    Boolean bloqueado,
    String mensajeBloqueo
) {
    public AlumnoPlayMaterial(
        Long id,
        String nombre,
        String archivoUrl,
        String tipoArchivo,
        Long pesoBytes
    ) {
        this(id, nombre, archivoUrl, tipoArchivo, pesoBytes, false, null);
    }
}
