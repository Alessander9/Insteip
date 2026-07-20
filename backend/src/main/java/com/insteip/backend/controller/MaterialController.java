package com.insteip.backend.controller;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.dto.material.MaterialResponseDTO;
import com.insteip.backend.domain.entity.Material;
import com.insteip.backend.domain.exception.ForbiddenException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.service.interfaces.MaterialService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/materiales")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMINISTRADOR') or @cursoSecurity.canAccessModulo(#moduloId)")
    public ResponseEntity<MaterialResponseDTO> subirMaterial(
            @RequestParam Long moduloId,
            @RequestParam String nombre,
            @RequestPart MultipartFile archivo) {
        return new ResponseEntity<>(materialService.crearMaterial(moduloId, nombre, archivo), HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMINISTRADOR') or @cursoSecurity.canAccessMaterial(#id)")
    public ResponseEntity<MaterialResponseDTO> editarMaterial(
            @PathVariable Long id,
            @RequestParam String nombre,
            @RequestPart(required = false) MultipartFile archivo) {
        return ResponseEntity.ok(materialService.editarMaterial(id, nombre, archivo));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or @cursoSecurity.canAccessMaterial(#id)")
    public ResponseEntity<Void> eliminarMaterial(@PathVariable Long id) {
        materialService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR') or @cursoSecurity.canAccessMaterial(#id)")
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

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ALUMNO', 'DOCENTE')")
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
}
