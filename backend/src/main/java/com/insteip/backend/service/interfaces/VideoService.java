package com.insteip.backend.service.interfaces;

import com.insteip.backend.dto.VideoRequestDTO;
import com.insteip.backend.dto.VideoResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface VideoService {
    Page<VideoResponseDTO> listarVideosPorModulo(Long moduloId, String search, Pageable pageable);
    Page<VideoResponseDTO> listarVideos(org.springframework.data.domain.Pageable pageable);
    VideoResponseDTO crearVideo(VideoRequestDTO dto);
    VideoResponseDTO editarVideo(Long id, VideoRequestDTO dto);
    void cambiarEstado(Long id, Boolean estado);
}
