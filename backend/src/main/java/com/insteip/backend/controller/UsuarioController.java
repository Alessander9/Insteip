package com.insteip.backend.controller;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.dto.DocenteRequestDTO;
import com.insteip.backend.dto.UsuarioRequestDTO;
import com.insteip.backend.dto.UsuarioResponseDTO;
import com.insteip.backend.service.interfaces.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<UsuarioResponseDTO>> listarAlumnos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "true") boolean includeInactive,
            @RequestParam(required = false, defaultValue = "fechaRegistro,desc") String sort) {
        org.springframework.data.domain.Pageable pageable = buildPageable(page, size, sort);
        return ResponseEntity.ok(usuarioService.listarAlumnos(pageable, search, includeInactive));
    }

    @GetMapping("/docentes")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<org.springframework.data.domain.Page<UsuarioResponseDTO>> listarDocentes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "fechaRegistro,desc") String sort) {
        org.springframework.data.domain.Pageable pageable = buildPageable(page, size, sort);
        return ResponseEntity.ok(usuarioService.listarDocentes(pageable, search));
    }

    @GetMapping("/docentes/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<UsuarioResponseDTO> obtenerDocente(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerDocente(id));
    }

    @PostMapping("/docentes")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<UsuarioResponseDTO> crearDocente(@Valid @RequestBody DocenteRequestDTO dto) {
        return new ResponseEntity<>(usuarioService.crearDocente(dto), HttpStatus.CREATED);
    }

    @PutMapping("/docentes/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<UsuarioResponseDTO> editarDocente(@PathVariable Long id, @Valid @RequestBody DocenteRequestDTO dto) {
        return ResponseEntity.ok(usuarioService.editarDocente(id, dto));
    }

    @PatchMapping("/docentes/{id}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> cambiarEstadoDocente(
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
        usuarioService.cambiarEstadoDocente(id, nuevoEstado);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> obtenerAlumno(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerAlumno(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> crearAlumno(@Valid @RequestBody UsuarioRequestDTO dto) {
        return new ResponseEntity<>(usuarioService.crearAlumno(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> editarAlumno(@PathVariable Long id, @Valid @RequestBody UsuarioRequestDTO dto) {
        return ResponseEntity.ok(usuarioService.editarAlumno(id, dto));
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
            // Default to true if not specified
            nuevoEstado = true;
        }
        usuarioService.cambiarEstado(id, nuevoEstado);
        return ResponseEntity.noContent().build();
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
