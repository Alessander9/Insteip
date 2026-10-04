package com.insteip.backend.controller;

import com.insteip.backend.domain.dto.demo.DemoActivarRequest;
import com.insteip.backend.domain.dto.demo.DemoActivarResponse;
import com.insteip.backend.domain.dto.demo.DemoCuentaDisponibleResponse;
import com.insteip.backend.service.interfaces.DemoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
public class DemoController {

    private final DemoService demoService;

    /**
     * Endpoint público: Asigna una cuenta demo disponible y devuelve la lista de cursos
     * indicando cuáles ya fueron probados por la IP del visitante.
     */
    @GetMapping("/cuenta-disponible")
    public ResponseEntity<DemoCuentaDisponibleResponse> obtenerCuentaDisponible(HttpServletRequest request) {
        return ResponseEntity.ok(demoService.obtenerCuentaYCursosDisponibles(request));
    }

    /**
     * Endpoint para activar la sesión: Valida los 2 cursos elegidos contra el historial de IP,
     * registra el consumo y entrega el token de 15-20 minutos para ingresar al dashboard.
     */
    @PostMapping("/activar")
    public ResponseEntity<DemoActivarResponse> activarDemo(
            @Valid @RequestBody DemoActivarRequest request,
            @RequestHeader(value = "Authorization", required = false) String bearerToken,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(demoService.activarDemo(request, bearerToken, httpRequest));
    }
}
