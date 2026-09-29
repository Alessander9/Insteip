package com.insteip.backend.domain.dto.experiencia;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoExpDto {
    private Long id;
    private String titulo;
    private String descripcion;
    private String youtubeUrl;
    private String youtubeId;
    private Integer duracionSegundos;
    private Integer orden;
}
