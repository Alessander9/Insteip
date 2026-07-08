package com.insteip.backend.dto;

public record UsuarioResponseDTO(
    Long id,
    String nombres,
    String apellidos,
    String correo,
    String telefono,
    String nivelSuscripcion,
    Boolean estado,
    java.time.LocalDateTime fechaRegistro
){}
