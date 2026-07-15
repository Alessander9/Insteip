package com.insteip.backend.controller;

import com.insteip.backend.entity.Certificado;
import com.insteip.backend.entity.Usuario;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.CertificadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/certificados")
@CrossOrigin(origins = "*")
public class CertificadoController {

    @Autowired
    private CertificadoService certificadoService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private com.insteip.backend.service.interfaces.AuditoriaService auditoriaService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALUMNO')")
    public ResponseEntity<org.springframework.data.domain.Page<com.insteip.backend.dto.CertificadoResponseDTO>> listarCertificados(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "fechaEmision,desc") String sort) {
        org.springframework.data.domain.Pageable pageable = buildPageable(page, size, sort);
        return ResponseEntity.ok(certificadoService.listarCertificados(pageable, search));
    }

    private final String UPLOADS_DIR = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "certificados";

    private Long getUsuarioId(Authentication authentication) {
        if (authentication == null) {
            return 2L; // Estudiante seed de prueba por defecto
        }
        return usuarioRepository.findByCorreo(authentication.getName())
                .map(Usuario::getId)
                .orElse(2L);
    }

    @PostMapping("/generar/{cursoId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALUMNO')")
    public ResponseEntity<com.insteip.backend.dto.CertificadoResponseDTO> generarCertificado(
            Authentication authentication,
            @PathVariable Long cursoId) {
        Long usuarioId = getUsuarioId(authentication);
        Certificado cert = certificadoService.generarCertificado(usuarioId, cursoId);
        com.insteip.backend.dto.CertificadoResponseDTO response = new com.insteip.backend.dto.CertificadoResponseDTO(
                cert.getId(),
                cert.getUsuario().getId(),
                cert.getCurso().getId(),
                cert.getCodigo(),
                cert.getArchivoPdf(),
                cert.getUrlValidacion(),
                cert.getNumeroRegistro(),
                cert.getFechaEmision()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALUMNO')")
    public ResponseEntity<byte[]> descargarCertificado(@PathVariable Long id) {
        Certificado cert = certificadoService.obtenerCertificado(id);
        
        Path filePath = Paths.get(UPLOADS_DIR).resolve(cert.getCodigo() + ".pdf");
        if (!Files.exists(filePath)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        try {
            byte[] pdfBytes = Files.readAllBytes(filePath);
            auditoriaService.registrarEvento("CERTIFICADOS", "DESCARGAR", "Descargado certificado ID: " + cert.getId() + " para el curso ID: " + cert.getCurso().getId());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificado-" + cert.getCodigo() + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/validar/{codigo}")
    public ResponseEntity<com.insteip.backend.dto.CertificadoValidacionResponse> validarCertificado(@PathVariable String codigo) {
        Certificado cert = certificadoService.validarCertificado(codigo);
        com.insteip.backend.dto.CertificadoValidacionResponse response = new com.insteip.backend.dto.CertificadoValidacionResponse(
                true,
                cert.getUsuario().getNombres() + " " + cert.getUsuario().getApellidos(),
                cert.getCurso().getNombre(),
                cert.getFechaEmision().toLocalDate(),
                cert.getCodigo()
        );
        return ResponseEntity.ok(response);
    }

    private org.springframework.data.domain.Pageable buildPageable(int page, int size, String sort) {
        if (sort == null || sort.isBlank()) {
            return PageRequest.of(page, size);
        }
        String[] parts = sort.split(",", 2);
        String property = parts[0].trim();
        Sort.Direction direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, property));
    }
}
