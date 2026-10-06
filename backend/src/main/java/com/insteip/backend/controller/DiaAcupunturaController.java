package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.diaacupuntura.ActualizarVideoTallerRequest;
import com.insteip.backend.domain.dto.diaacupuntura.MatriculaLoteEventoRequest;
import com.insteip.backend.domain.dto.diaacupuntura.MatriculaResultadoResponse;
import com.insteip.backend.domain.dto.diaacupuntura.ResumenInscritosEventoResponse;
import com.insteip.backend.domain.dto.diaacupuntura.TallerEventoResponse;
import com.insteip.backend.service.interfaces.DiaAcupunturaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dia-acupuntura")
@RequiredArgsConstructor
public class DiaAcupunturaController {

    private final DiaAcupunturaService diaAcupunturaService;

    @GetMapping("/talleres")
    public ResponseEntity<List<TallerEventoResponse>> listarTalleres(Authentication authentication) {
        String correo = (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName()))
                ? authentication.getName()
                : null;
        return ResponseEntity.ok(diaAcupunturaService.listarTalleres(correo));
    }

    @GetMapping("/admin/resumen")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<ResumenInscritosEventoResponse>> obtenerResumenInscritos() {
        return ResponseEntity.ok(diaAcupunturaService.obtenerResumenInscritos());
    }

    @PostMapping("/admin/matricular-lote")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<MatriculaResultadoResponse>> matricularLote(@Valid @RequestBody List<MatriculaLoteEventoRequest> solicitudes) {
        List<MatriculaResultadoResponse> res = diaAcupunturaService.matricularLote(solicitudes);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/admin/matricular-individual")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<MatriculaResultadoResponse> matricularIndividual(@Valid @RequestBody MatriculaLoteEventoRequest request) {
        MatriculaResultadoResponse res = diaAcupunturaService.matricularIndividual(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/admin/talleres/{id}/videos")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> agregarVideoTaller(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarVideoTallerRequest request) {
        diaAcupunturaService.guardarVideoTaller(id, null, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/admin/talleres/{id}/videos/{videoId}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> actualizarVideoTaller(
            @PathVariable Long id,
            @PathVariable Long videoId,
            @Valid @RequestBody ActualizarVideoTallerRequest request) {
        diaAcupunturaService.guardarVideoTaller(id, videoId, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/admin/talleres/{id}/videos/{videoId}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminarVideoTaller(
            @PathVariable Long id,
            @PathVariable Long videoId) {
        diaAcupunturaService.eliminarVideoTaller(id, videoId);
        return ResponseEntity.noContent().build();
    }
}
