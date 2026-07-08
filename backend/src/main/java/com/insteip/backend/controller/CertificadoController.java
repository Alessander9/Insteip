package com.insteip.backend.controller;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.entity.Certificado;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.CertificadoService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/certificados")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CertificadoController {

    private final CertificadoService certificadoService;

    private final UsuarioRepository usuarioRepository;

    private final com.insteip.backend.service.interfaces.AuditoriaService auditoriaService;

    @Value("${application.storage.path:uploads}")
    private String storagePathSetting;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALUMNO')")
    public ResponseEntity<java.util.List<com.insteip.backend.dto.CertificadoResponseDTO>> listarCertificados(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(certificadoService.listarCertificados(search));
    }

    private Long getUsuarioId(Authentication authentication) {
        if (authentication == null) {
            return 2L; // Estudiante seed de prueba por defecto
        }
        return usuarioRepository.findByCorreo(authentication.getName())
                .map(usuario -> usuario.getId())
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
                cert.getUsuario().getNombres() + " " + cert.getUsuario().getApellidos(),
                cert.getUsuario().getCorreo(),
                cert.getCurso().getNombre(),
                cert.getCodigo(),
                (cert.getArchivoPdf() == null || cert.getArchivoPdf().isBlank())
                        ? "http://localhost:8081/api/certificados/" + cert.getId() + "/download"
                        : cert.getArchivoPdf(),
                (cert.getUrlValidacion() == null || cert.getUrlValidacion().isBlank())
                        ? "http://localhost:4200/certificados/validar/" + cert.getCodigo()
                        : cert.getUrlValidacion(),
                cert.getNumeroRegistro(),
                cert.getFechaEmision()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALUMNO')")
    public ResponseEntity<byte[]> descargarCertificado(@PathVariable Long id) {
        Certificado cert = certificadoService.obtenerCertificado(id);

        Path basePath = Paths.get(storagePathSetting).toAbsolutePath().normalize().resolve("certificados");
        Path filePath = basePath.resolve(cert.getCodigo() + ".pdf").normalize();
        if (!filePath.startsWith(basePath) || !Files.exists(filePath)) {
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
}
