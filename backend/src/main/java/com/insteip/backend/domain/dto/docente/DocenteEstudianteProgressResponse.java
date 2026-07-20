package com.insteip.backend.domain.dto.docente;

import java.time.LocalDateTime;

public record DocenteEstudianteProgressResponse(
    Long estudianteId,
    String nombres,
    String apellidos,
    String correo,
    Double porcentajeAvance,
    Boolean completado,
    LocalDateTime fechaActualizacion
){}
