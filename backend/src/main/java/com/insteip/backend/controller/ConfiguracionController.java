package com.insteip.backend.controller;

import com.insteip.backend.dto.ConfiguracionRequest;
import com.insteip.backend.dto.ConfiguracionResponse;
import com.insteip.backend.service.interfaces.ConfiguracionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/configuracion")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class ConfiguracionController {

    @Autowired
    private ConfiguracionService configuracionService;

    @GetMapping
    public ResponseEntity<ConfiguracionResponse> obtenerConfiguracion() {
        return ResponseEntity.ok(configuracionService.obtenerConfiguracion());
    }

    @PutMapping
    public ResponseEntity<ConfiguracionResponse> actualizarConfiguracion(
            @Valid @RequestBody ConfiguracionRequest request) {
        return ResponseEntity.ok(configuracionService.actualizarConfiguracion(request));
    }
}
