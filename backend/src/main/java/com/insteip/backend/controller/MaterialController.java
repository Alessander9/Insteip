package com.insteip.backend.controller;

import com.insteip.backend.dto.MaterialResponseDTO;
import com.insteip.backend.entity.Material;
import com.insteip.backend.exception.ForbiddenException;
import com.insteip.backend.exception.ResourceNotFoundException;
import com.insteip.backend.service.interfaces.MaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/materiales")
@CrossOrigin(origins = "*")
public class MaterialController {

    @Autowired
    private MaterialService materialService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<MaterialResponseDTO> subirMaterial(
            @RequestParam Long moduloId,
            @RequestParam String nombre,
            @RequestPart MultipartFile archivo) {
        return new ResponseEntity<>(materialService.crearMaterial(moduloId, nombre, archivo), HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<MaterialResponseDTO> editarMaterial(
            @PathVariable Long id,
            @RequestParam String nombre,
            @RequestPart(required = false) MultipartFile archivo) {
        return ResponseEntity.ok(materialService.editarMaterial(id, nombre, archivo));
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
        materialService.cambiarEstado(id, nuevoEstado);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/modulo/{moduloId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DOCENTE')")
    public ResponseEntity<org.springframework.data.domain.Page<MaterialResponseDTO>> listarMaterialesPorModulo(
            @PathVariable Long moduloId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "fechaSubida,desc") String sort) {
        org.springframework.data.domain.Pageable pageable = buildPageable(page, size, sort);
        return ResponseEntity.ok(materialService.listarMaterialesPorModulo(moduloId, search, pageable, true));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALUMNO')")
    public ResponseEntity<byte[]> descargarMaterial(@PathVariable Long id) {
        try {
            Material material = materialService.obtenerMaterialEntity(id);
            byte[] data = materialService.descargarMaterialBytes(id);

            String filename = material.getNombre();
            String extension = "";
            String cleanType = material.getTipoArchivo() != null ? material.getTipoArchivo() : "application/octet-stream";

            if ("application/pdf".equalsIgnoreCase(cleanType)) extension = ".pdf";
            else if ("application/msword".equalsIgnoreCase(cleanType)) extension = ".doc";
            else if ("application/vnd.openxmlformats-officedocument.wordprocessingml.document".equalsIgnoreCase(cleanType)) extension = ".docx";
            else if ("image/jpeg".equalsIgnoreCase(cleanType)) extension = ".jpg";
            else if ("image/png".equalsIgnoreCase(cleanType)) extension = ".png";

            if (!filename.toLowerCase().endsWith(extension)) {
                filename += extension;
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType(cleanType))
                    .body(data);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (ForbiddenException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
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
