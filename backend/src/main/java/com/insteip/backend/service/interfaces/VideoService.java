package com.insteip.backend.service.interfaces;

import com.insteip.backend.dto.VideoRequestDTO;
import com.insteip.backend.dto.VideoResponseDTO;
import java.util.List;

public interface VideoService {
    List<VideoResponseDTO> listarVideosPorModulo(Long moduloId);
    org.springframework.data.domain.Page<VideoResponseDTO> listarVideos(org.springframework.data.domain.Pageable pageable);
    VideoResponseDTO crearVideo(VideoRequestDTO dto);
    VideoResponseDTO editarVideo(Long id, VideoRequestDTO dto);
    void cambiarEstado(Long id, Boolean estado);
}
