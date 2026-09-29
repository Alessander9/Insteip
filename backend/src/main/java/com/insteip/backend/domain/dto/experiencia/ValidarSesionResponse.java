package com.insteip.backend.domain.dto.experiencia;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidarSesionResponse {
    private Boolean valida;
    private Long segundosRestantes;
    private LocalDateTime expiraSesion;
}
