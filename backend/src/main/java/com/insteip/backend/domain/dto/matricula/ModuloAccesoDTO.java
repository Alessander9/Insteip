package com.insteip.backend.domain.dto.matricula;

import java.time.LocalDateTime;
import java.util.List;

public record ModuloAccesoDTO(
    Long moduloId,
    String nombreModulo,
    Integer orden,
    Boolean habilitado,
    LocalDateTime fechaHabilitacion,
    List<VideoAccesoDTO> videos,
    List<MaterialAccesoDTO> materiales
) {
    public ModuloAccesoDTO(
        Long moduloId,
        String nombreModulo,
        Integer orden,
        Boolean habilitado,
        LocalDateTime fechaHabilitacion
    ) {
        this(moduloId, nombreModulo, orden, habilitado, fechaHabilitacion, List.of(), List.of());
    }

    public ModuloAccesoDTO(
        Long moduloId,
        String nombreModulo,
        Integer orden,
        Boolean habilitado,
        LocalDateTime fechaHabilitacion,
        List<VideoAccesoDTO> videos
    ) {
        this(moduloId, nombreModulo, orden, habilitado, fechaHabilitacion, videos, List.of());
    }
}
