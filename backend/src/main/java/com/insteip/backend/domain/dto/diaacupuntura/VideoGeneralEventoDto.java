package com.insteip.backend.domain.dto.diaacupuntura;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class VideoGeneralEventoDto {
    private String youtubeUrl;
    private String youtubeId;
    private String titulo;
    private String descripcion;
    private Integer duracionMinutos;
    private Boolean activo;
}
