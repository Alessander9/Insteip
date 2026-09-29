package com.insteip.backend.domain.dto.experiencia;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialExpDto {
    private Long id;
    private String nombre;
    private String tipo;
    @Builder.Default
    private Boolean bloqueado = true;
    @Builder.Default
    private String mensajeBloqueo = "Disponible con tu plan de suscripción";
}
