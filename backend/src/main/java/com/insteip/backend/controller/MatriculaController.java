package com.insteip.backend.controller;

import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.dto.matricula.MatriculaRequestDTO;
import com.insteip.backend.domain.dto.matricula.MatriculaResponseDTO;
import com.insteip.backend.service.interfaces.MatriculaService;
import com.insteip.backend.service.interfaces.MatriculaPdfService;
import com.insteip.backend.service.interfaces.AuditoriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matriculas")
@RequiredArgsConstructor
public class MatriculaController {

    private final MatriculaService matriculaService;
    private final MatriculaPdfService matriculaPdfService;
    private final AuditoriaService auditoriaService;

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<MatriculaResponseDTO> matricularAlumno(@Valid @RequestBody MatriculaRequestDTO dto) {
        return new ResponseEntity<>(matriculaService.matricularAlumno(dto), HttpStatus.CREATED);
    }

    @GetMapping("/curso/{cursoId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<List<MatriculaResponseDTO>> listarMatriculados(@PathVariable Long cursoId) {
        return ResponseEntity.ok(matriculaService.listarMatriculadosPorCurso(cursoId));
    }

    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<List<MatriculaResponseDTO>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(matriculaService.listarMatriculadosPorUsuario(usuarioId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        matriculaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
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
        matriculaService.cambiarEstado(id, nuevoEstado);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE', 'ALUMNO')")
    public ResponseEntity<byte[]> descargarPdfMatricula(@PathVariable Long id, Authentication authentication) {
        String correo = authentication != null ? authentication.getName() : null;
        byte[] pdfBytes = matriculaPdfService.generarPdfMatricula(id, correo);

        auditoriaService.registrarEvento("MATRICULAS", "DESCARGAR_FICHA_PDF", 
                "Descargada ficha consolidada de matrícula en PDF (ID: " + id + ") por: " + (correo != null ? correo : "ANÓNIMO"));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ficha-matricula-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/curso/{cursoId}/mi-ficha")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALUMNO')")
    public ResponseEntity<byte[]> descargarMiFichaPorCurso(@PathVariable Long cursoId, Authentication authentication) {
        String correo = authentication != null ? authentication.getName() : null;
        byte[] pdfBytes = matriculaPdfService.generarMiPdfMatriculaPorCurso(cursoId, correo);

        auditoriaService.registrarEvento("MATRICULAS", "DESCARGAR_MI_FICHA_PDF", 
                "Descargada mi ficha de matrícula para el curso ID: " + cursoId + " por: " + correo);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"mi-ficha-matricula-curso-" + cursoId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
