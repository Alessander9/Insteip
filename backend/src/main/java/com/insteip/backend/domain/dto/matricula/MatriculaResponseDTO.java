package com.insteip.backend.domain.dto.matricula;

import java.time.LocalDateTime;

public record MatriculaResponseDTO(
    Long id,
    Long usuarioId,
    String alumnoNombres,
    String alumnoApellidos,
    String alumnoCorreo,
    Long cursoId,
    String cursoNombre,
    LocalDateTime fechaMatricula,
    Boolean estado
) {}
