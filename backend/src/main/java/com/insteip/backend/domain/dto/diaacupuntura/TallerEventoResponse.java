package com.insteip.backend.domain.dto.diaacupuntura;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TallerEventoResponse {
    private Long id;
    private String nombre;
    private String descripcion;
    private String imagenPortada;
    private String docente;
    private Integer duracionMinutos;
    private boolean inscrito;
    private Long matriculaId;
    private Integer orden;

    // Módulo principal del taller
    private Long moduloId;

    // Lista de uno o más videos/clases del taller
    private List<VideoEventoDto> videos;
    private List<MaterialEventoDto> materiales;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VideoEventoDto {
        private Long id;
        private String titulo;
        private String youtubeUrl;
        private String youtubeId;
        private Integer duracionMinutos;
        private Integer orden;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaterialEventoDto {
        private Long id;
        private String nombre;
        private String archivoUrl;
        private String tipoArchivo;
    }
}
