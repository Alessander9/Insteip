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
public class DemoActivarResponse {
    private String token;
    private long expiraEnSegundos;
    private List<Long> demoCursoIds;
    private String correo;
}
