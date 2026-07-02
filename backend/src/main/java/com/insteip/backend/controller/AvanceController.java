package com.insteip.backend.controller;

import com.insteip.backend.dto.AvanceProgressRequest;
import com.insteip.backend.dto.AvanceProgressResponse;
import com.insteip.backend.entity.Usuario;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.AvanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/avance")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ALUMNO', 'ADMINISTRADOR')")
public class AvanceController {

    @Autowired
    private AvanceService avanceService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private Long getUsuarioId(Authentication authentication) {
        if (authentication == null) {
            return 2L; // Estudiante seed de prueba por defecto
        }
        return usuarioRepository.findByCorreo(authentication.getName())
                .map(Usuario::getId)
                .orElse(2L);
    }

    @PostMapping
    public ResponseEntity<AvanceProgressResponse> guardarProgreso(
            Authentication authentication,
            @Valid @RequestBody AvanceProgressRequest request) {
        Long usuarioId = getUsuarioId(authentication);
        return ResponseEntity.ok(avanceService.guardarProgreso(usuarioId, request));
    }

    @GetMapping("/video/{id}")
    public ResponseEntity<AvanceProgressResponse> obtenerProgreso(
            Authentication authentication,
            @PathVariable Long id) {
        Long usuarioId = getUsuarioId(authentication);
        try {
            return ResponseEntity.ok(avanceService.obtenerProgreso(usuarioId, id));
        } catch (Exception e) {
            return ResponseEntity.ok(AvanceProgressResponse.builder()
                    .videoId(id)
                    .ultimoSegundo(0)
                    .porcentajeVisto(java.math.BigDecimal.ZERO)
                    .completado(false)
                    .build());
        }
    }
}
