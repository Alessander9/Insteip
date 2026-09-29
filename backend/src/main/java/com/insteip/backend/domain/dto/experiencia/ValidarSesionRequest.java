package com.insteip.backend.domain.dto.experiencia;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidarSesionRequest {
    @NotBlank(message = "El session token es requerido")
    private String sessionToken;
}
