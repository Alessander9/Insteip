package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.experiencia.*;
import com.insteip.backend.service.interfaces.ExperienciaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/experiencias")
@RequiredArgsConstructor
public class ExperienciaController {

    private final ExperienciaService experienciaService;

    /**
     * Endpoint 1: Verifica el estado del visitante (LIBRE, BLOQUEADO o AGOTADO).
     */
    @PostMapping("/verificar")
    public ResponseEntity<VerificarExpResponse> verificarEstado(
            @Valid @RequestBody VerificarExpRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(experienciaService.verificarEstado(request, httpRequest));
    }

    /**
     * Endpoint 2: Lista todos los cursos disponibles marcando con flag 'yaVisto' los explorados previamente.
     */
    @GetMapping("/cursos")
    public ResponseEntity<List<CursoExpDto>> listarCursos(
            @RequestParam(required = false) String correo,
            @RequestParam(required = false) String cookieId,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(experienciaService.listarCursosParaExperiencia(correo, cookieId, httpRequest));
    }

    /**
     * Endpoint 3: Inicia la sesión de 15 minutos, registra el uso y devuelve la estructura completa de los 2 cursos.
     */
    @PostMapping("/iniciar")
    public ResponseEntity<IniciarExpResponse> iniciarExperiencia(
            @Valid @RequestBody IniciarExpRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(experienciaService.iniciarExperiencia(request, httpRequest));
    }

    /**
     * Endpoint 4: Valida la vigencia del token de sesión de 15 minutos al cargar o recargar /play.
     */
    @PostMapping("/validar-sesion")
    public ResponseEntity<ValidarSesionResponse> validarSesion(
            @Valid @RequestBody ValidarSesionRequest request) {
        return ResponseEntity.ok(experienciaService.validarSesion(request));
    }
}
