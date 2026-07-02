package com.insteip.backend.controller;

import com.insteip.backend.dto.VideoRequestDTO;
import com.insteip.backend.dto.VideoResponseDTO;
import com.insteip.backend.service.interfaces.VideoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/videos")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class VideoController {

    @Autowired
    private VideoService videoService;

    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<VideoResponseDTO>> listarVideos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(videoService.listarVideos(pageable));
    }

    @PostMapping
    public ResponseEntity<VideoResponseDTO> crearVideo(@Valid @RequestBody VideoRequestDTO dto) {
        return new ResponseEntity<>(videoService.crearVideo(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VideoResponseDTO> editarVideo(@PathVariable Long id, @Valid @RequestBody VideoRequestDTO dto) {
        return ResponseEntity.ok(videoService.editarVideo(id, dto));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Void> cambiarEstado(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean estado,
            @RequestBody(required = false) Map<String, Boolean> body) {
            
        Boolean nuevoEstado = estado;
        if (nuevoEstado == null && body != null) {
            nuevoEstado = body.get("estado");
        }
        if (nuevoEstado == null) {
            nuevoEstado = true;
        }
        videoService.cambiarEstado(id, nuevoEstado);
        return ResponseEntity.noContent().build();
    }
}
