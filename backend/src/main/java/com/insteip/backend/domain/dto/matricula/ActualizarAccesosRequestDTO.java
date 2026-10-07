package com.insteip.backend.domain.dto.matricula;

import java.util.List;

public record ActualizarAccesosRequestDTO(
    List<Long> modulosHabilitadosIds,
    List<Long> videosHabilitadosIds,
    List<Long> materialesHabilitadosIds
) {
    public ActualizarAccesosRequestDTO(
        List<Long> modulosHabilitadosIds,
        List<Long> videosHabilitadosIds
    ) {
        this(modulosHabilitadosIds, videosHabilitadosIds, null);
    }
}
