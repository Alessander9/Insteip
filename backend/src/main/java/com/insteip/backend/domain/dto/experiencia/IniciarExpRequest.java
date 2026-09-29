package com.insteip.backend.domain.dto.experiencia;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IniciarExpRequest {

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "Formato de correo inválido")
    private String correo;

    private String cookieId;

    @NotNull(message = "Debes seleccionar cursos")
    @Size(min = 2, max = 2, message = "Debes seleccionar exactamente 2 cursos")
    private List<Long> cursosElegidos;
}
