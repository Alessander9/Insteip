package com.insteip.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvanceProgressResponse {
    private Long videoId;
    private Integer ultimoSegundo;
    private BigDecimal porcentajeVisto;
    private Boolean completado;
}
