package com.insteip.backend.domain.dto.demo;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DemoActivarRequest {

    @NotEmpty(message = "Debes seleccionar cursos")
    @Size(min = 2, max = 2, message = "Debes seleccionar exactamente 2 cursos")
    private List<Long> cursoIds;
}
