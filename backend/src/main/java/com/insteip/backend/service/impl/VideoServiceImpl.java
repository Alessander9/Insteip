package com.insteip.backend.service.impl;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.dto.VideoRequestDTO;
import com.insteip.backend.dto.VideoResponseDTO;
import com.insteip.backend.entity.Video;
import com.insteip.backend.entity.Modulo;
import com.insteip.backend.exception.ResourceNotFoundException;
import com.insteip.backend.repository.VideoRepository;
import com.insteip.backend.repository.ModuloRepository;
import com.insteip.backend.service.interfaces.VideoService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VideoServiceImpl implements VideoService {

    private final VideoRepository videoRepository;

    private final ModuloRepository moduloRepository;

    private final com.insteip.backend.service.interfaces.AuditoriaService auditoriaService;

    @Override
    public List<VideoResponseDTO> listarVideosPorModulo(Long moduloId) {
        if (!moduloRepository.existsById(moduloId)) {
            throw new ResourceNotFoundException("Módulo no encontrado con id: " + moduloId);
        }
        return videoRepository.findByModuloIdOrderByOrdenAsc(moduloId).stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public org.springframework.data.domain.Page<VideoResponseDTO> listarVideos(org.springframework.data.domain.Pageable pageable) {
        return videoRepository.findAll(pageable).map(this::convertToResponseDto);
    }

    @Override
    public VideoResponseDTO crearVideo(VideoRequestDTO dto) {
        Modulo modulo = moduloRepository.findById(dto.moduloId())
                .orElseThrow(() -> new ResourceNotFoundException("Módulo no encontrado con id: " + dto.moduloId()));

        String youtubeId = extraerIdYoutube(dto.youtubeUrl());

        Video video = Video.builder()
                .modulo(modulo)
                .titulo(dto.titulo())
                .descripcion(dto.descripcion())
                .youtubeUrl(dto.youtubeUrl())
                .youtubeId(youtubeId)
                .duracionSegundos(0)
                .orden(dto.orden())
                .estado(true)
                .build();

        Video saved = videoRepository.save(video);
        auditoriaService.registrarEvento("VIDEO", "CREAR", "Creado video: " + saved.getTitulo() + " (ID: " + saved.getId() + ")");
        return convertToResponseDto(saved);
    }

    @Override
    public VideoResponseDTO editarVideo(Long id, VideoRequestDTO dto) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video no encontrado con id: " + id));

        Modulo modulo = moduloRepository.findById(dto.moduloId())
                .orElseThrow(() -> new ResourceNotFoundException("Módulo no encontrado con id: " + dto.moduloId()));

        String youtubeId = extraerIdYoutube(dto.youtubeUrl());

        video.setModulo(modulo);
        video.setTitulo(dto.titulo());
        video.setDescripcion(dto.descripcion());
        video.setYoutubeUrl(dto.youtubeUrl());
        video.setYoutubeId(youtubeId);
        video.setOrden(dto.orden());

        Video saved = videoRepository.save(video);
        auditoriaService.registrarEvento("VIDEO", "EDITAR", "Editado video: " + saved.getTitulo() + " (ID: " + saved.getId() + ")");
        return convertToResponseDto(saved);
    }

    @Override
    public void cambiarEstado(Long id, Boolean estado) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video no encontrado con id: " + id));
        video.setEstado(estado);
        Video saved = videoRepository.save(video);
        auditoriaService.registrarEvento("VIDEO", estado ? "ACTIVAR" : "DESACTIVAR", 
                (estado ? "Activado" : "Desactivado") + " video: " + saved.getTitulo() + " (ID: " + saved.getId() + ")");
    }

    private String extraerIdYoutube(String url) {
        if (url == null) return null;
        String pattern = "(?<=watch\\?v=|/videos/|embed/|youtu.be/|/v/|/e/|watch\\?v%3D|watch\\?feature=player_embedded&v=)[^#\\&\\?]*";
        Pattern compiledPattern = Pattern.compile(pattern);
        Matcher matcher = compiledPattern.matcher(url);
        if (matcher.find()) {
            return matcher.group();
        }
        return null;
    }

    private VideoResponseDTO convertToResponseDto(Video v) {
        return new VideoResponseDTO(
                v.getId(),
                v.getTitulo(),
                v.getDescripcion(),
                v.getYoutubeUrl(),
                v.getOrden(),
                v.getEstado()
        );
    }
}
