package com.insteip.backend.dto;

public record ConfiguracionResponse(
    Long id,
    String nombreInstitucion,
    String logoUrl,
    String correo,
    String telefono,
    String direccion,
    String qrYape,
    String qrPlin,
    String paypalUrl,
    String colorPrincipal,
    String colorSecundario
) {}
