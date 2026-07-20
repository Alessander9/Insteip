package com.insteip.backend.domain.dto.alumno;

import java.util.List;

public record AlumnoPlayModulo(
    Long id,
    String nombre,
    String descripcion,
    Integer orden,
    List<AlumnoPlayVideo> videos,
    List<AlumnoPlayMaterial> materiales
) {}
