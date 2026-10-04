package com.insteip.backend.domain.dto.demo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemoCuentaDisponibleResponse {
    private String tokenTemporal;
    private String correoAsignado;
    private List<DemoCursoDto> cursos;
    private boolean todosCursosVistos;
    private long totalCursosDisponibles;
}
