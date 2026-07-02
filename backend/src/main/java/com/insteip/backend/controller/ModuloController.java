package com.insteip.backend.controller;

import com.insteip.backend.dto.ModuloRequestDTO;
import com.insteip.backend.dto.ModuloResponseDTO;
import com.insteip.backend.service.interfaces.ModuloService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/modulos")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class ModuloController {

    @Autowired
    private ModuloService moduloService;

    @Autowired
    private com.insteip.backend.service.interfaces.VideoService videoService;

    @Autowired
    private com.insteip.backend.service.interfaces.MaterialService materialService;

    @GetMapping("/{id}")
    public ResponseEntity<ModuloResponseDTO> obtenerModulo(@PathVariable Long id) {
        return ResponseEntity.ok(moduloService.obtenerModulo(id));
    }

    @GetMapping("/{id}/videos")
    public ResponseEntity<java.util.List<com.insteip.backend.dto.VideoResponseDTO>> listarVideosPorModulo(@PathVariable Long id) {
        return ResponseEntity.ok(videoService.listarVideosPorModulo(id));
    }

    @GetMapping("/{id}/materiales")
    public ResponseEntity<java.util.List<com.insteip.backend.dto.MaterialResponseDTO>> listarMaterialesPorModulo(@PathVariable Long id) {
        return ResponseEntity.ok(materialService.listarMaterialesPorModulo(id));
    }

    @PostMapping
    public ResponseEntity<ModuloResponseDTO> crearModulo(@Valid @RequestBody ModuloRequestDTO dto) {
        return new ResponseEntity<>(moduloService.crearModulo(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ModuloResponseDTO> editarModulo(@PathVariable Long id, @Valid @RequestBody ModuloRequestDTO dto) {
        return ResponseEntity.ok(moduloService.editarModulo(id, dto));
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
        moduloService.cambiarEstado(id, nuevoEstado);
        return ResponseEntity.noContent().build();
    }
}
