package com.insteip.backend.dto;

import java.util.List;

public record AlumnoPlayModulo(
    Long id,
    String nombre,
    String descripcion,
    Integer orden,
    List<AlumnoPlayVideo> videos,
    List<AlumnoPlayMaterial> materiales
) {}
