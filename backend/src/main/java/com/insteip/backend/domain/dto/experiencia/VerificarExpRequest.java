package com.insteip.backend.domain.dto.experiencia;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificarExpRequest {

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "Formato de correo inválido")
    private String correo;

    private String cookieId;
}
