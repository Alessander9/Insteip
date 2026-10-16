package com.insteip.backend.domain.dto.diaacupuntura;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarVideoGeneralRequest {

    @NotBlank(message = "La URL de YouTube es requerida.")
    private String youtubeUrl;

    private String titulo;

    private String descripcion;

    private Integer duracionMinutos;

    @Builder.Default
    private Boolean activo = true;
}
