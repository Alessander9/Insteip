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
public class ActualizarVideoTallerRequest {
    @NotBlank(message = "El enlace de YouTube es obligatorio")
    private String youtubeUrl;
    private String titulo;
    private Integer duracionMinutos;
}
