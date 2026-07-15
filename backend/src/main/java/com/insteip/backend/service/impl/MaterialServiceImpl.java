package com.insteip.backend.service.impl;

import com.insteip.backend.dto.MaterialResponseDTO;
import com.insteip.backend.entity.Material;
import com.insteip.backend.entity.Modulo;
import com.insteip.backend.entity.Matricula;
import com.insteip.backend.entity.Usuario;
import com.insteip.backend.exception.ResourceNotFoundException;
import com.insteip.backend.exception.BadRequestException;
import com.insteip.backend.repository.MaterialRepository;
import com.insteip.backend.repository.ModuloRepository;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.repository.MatriculaRepository;
import com.insteip.backend.service.interfaces.MaterialService;
import com.insteip.backend.service.interfaces.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class MaterialServiceImpl implements MaterialService {

    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024L * 1024L;
    private static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(Arrays.asList(
            ".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"
    ));
    private static final Set<String> ALLOWED_CONTENT_TYPES = new HashSet<>(Arrays.asList(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/png",
            "image/jpeg"
    ));

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private ModuloRepository moduloRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MatriculaRepository matriculaRepository;

    @Autowired
    private AuditoriaService auditoriaService;

    @org.springframework.beans.factory.annotation.Value("${application.storage.path}")
    private String storagePathSetting;

    private String UPLOADS_DIR;

    @jakarta.annotation.PostConstruct
    public void init() {
        java.nio.file.Path base = java.nio.file.Paths.get(storagePathSetting).toAbsolutePath().normalize();
        this.UPLOADS_DIR = base.resolve("materiales").toString();
        try {
            Files.createDirectories(java.nio.file.Paths.get(this.UPLOADS_DIR));
        } catch (IOException e) {
            System.err.println("Could not create uploads directory: " + e.getMessage());
        }
    }

    @Override
    public List<MaterialResponseDTO> listarMaterialesPorModulo(Long moduloId) {
        if (!moduloRepository.existsById(moduloId)) {
            throw new ResourceNotFoundException("Módulo no encontrado con id: " + moduloId);
        }
        return materialRepository.findByModuloId(moduloId).stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public Page<MaterialResponseDTO> listarMaterialesPorModulo(Long moduloId, Pageable pageable) {
        if (!moduloRepository.existsById(moduloId)) {
            throw new ResourceNotFoundException("Módulo no encontrado con id: " + moduloId);
        }
        return materialRepository.findByModuloId(moduloId, pageable).map(this::convertToResponseDto);
    }

    public Page<MaterialResponseDTO> listarMaterialesPorModulo(Long moduloId, String search, Pageable pageable, boolean useSearch) {
        if (!moduloRepository.existsById(moduloId)) {
            throw new ResourceNotFoundException("Módulo no encontrado con id: " + moduloId);
        }
        String term = search == null ? "" : search.trim();
        return materialRepository.searchByModuloId(moduloId, term, pageable).map(this::convertToResponseDto);
    }

    @Override
    public MaterialResponseDTO crearMaterial(Long moduloId, String nombre, MultipartFile archivo) {
        Modulo modulo = moduloRepository.findById(moduloId)
                .orElseThrow(() -> new ResourceNotFoundException("Módulo no encontrado con id: " + moduloId));

        // File validation (Max 10MB, whitelisted/blocked executables)
        validarArchivo(archivo);
        String extension = obtenerExtensionSegura(archivo.getOriginalFilename());
        String internalFilename = UUID.randomUUID().toString() + extension;

        // Save to DB first to get the ID for file naming
        Material material = Material.builder()
                .modulo(modulo)
                .nombre(nombre)
                .archivoUrl("") // Will update after saving
                .archivoInterno(internalFilename)
                .tipoArchivo(getCleanContentType(archivo))
                .pesoBytes(archivo.getSize())
                .estado(true)
                .build();

        material = materialRepository.save(material);

        try {
            Path targetPath = Paths.get(UPLOADS_DIR).resolve(material.getArchivoInterno());
            Files.copy(archivo.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            materialRepository.delete(material);
            throw new RuntimeException("Error al guardar el archivo en el servidor: " + e.getMessage());
        }

        // Update URL
        material.setArchivoUrl("http://localhost:8081/api/materiales/" + material.getId() + "/download");
        Material saved = materialRepository.save(material);

        // System Audit
        auditoriaService.registrarEvento("MATERIAL", "CREAR", "Subido material: " + saved.getNombre() + " (ID: " + saved.getId() + ")");

        return convertToResponseDto(saved);
    }

    @Override
    public MaterialResponseDTO editarMaterial(Long id, String nombre, MultipartFile archivo) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado con id: " + id));

        material.setNombre(nombre);

        if (archivo != null && !archivo.isEmpty()) {
            // File validation (Max 10MB, whitelisted/blocked executables)
            validarArchivo(archivo);
            String extension = obtenerExtensionSegura(archivo.getOriginalFilename());
            String internalFilename = UUID.randomUUID().toString() + extension;

            try {
                // Delete previous matches first
                if (material.getArchivoInterno() != null && !material.getArchivoInterno().isBlank()) {
                    Files.deleteIfExists(Paths.get(UPLOADS_DIR).resolve(material.getArchivoInterno()));
                }

                Path targetPath = Paths.get(UPLOADS_DIR).resolve(internalFilename);
                Files.copy(archivo.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
                
                material.setArchivoInterno(internalFilename);
                material.setTipoArchivo(getCleanContentType(archivo));
                material.setPesoBytes(archivo.getSize());
                material.setArchivoUrl("http://localhost:8081/api/materiales/" + material.getId() + "/download");
            } catch (IOException e) {
                throw new RuntimeException("Error al actualizar el archivo en el servidor: " + e.getMessage());
            }
        }

        Material saved = materialRepository.save(material);

        // System Audit
        auditoriaService.registrarEvento("MATERIAL", "EDITAR", "Editado material: " + saved.getNombre() + " (ID: " + saved.getId() + ")");

        return convertToResponseDto(saved);
    }

    @Override
    public void cambiarEstado(Long id, Boolean estado) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado con id: " + id));
        material.setEstado(estado);
        Material saved = materialRepository.save(material);
        auditoriaService.registrarEvento("MATERIAL", estado ? "ACTIVAR" : "DESACTIVAR", 
                (estado ? "Activado" : "Desactivado") + " material: " + saved.getNombre() + " (ID: " + saved.getId() + ")");
    }

    @Override
    public Material obtenerMaterialEntity(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado con id: " + id));
    }

    @Override
    @Transactional
    public byte[] descargarMaterialBytes(Long id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material no encontrado con id: " + id));

        // Secure Downloads Check: authenticated, active user, active enrollment, active course/module/material.
        org.springframework.security.core.Authentication authentication = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            registrarDescargaDenegada(material, "Usuario no autenticado");
            throw new com.insteip.backend.exception.ForbiddenException("No tiene permisos para acceder a este recurso.");
        }

        String correo = authentication.getName();
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (usuario.getEstado() == null || !usuario.getEstado()) {
            registrarDescargaDenegada(material, "Usuario inactivo");
            throw new com.insteip.backend.exception.ForbiddenException("No tiene permisos para acceder a este recurso.");
        }

        boolean isAdmin = usuario.getRol() != null
                && "ADMINISTRADOR".equalsIgnoreCase(usuario.getRol().getNombre());

        Modulo modulo = material.getModulo();
        if (material.getEstado() == null || !material.getEstado()
                || modulo == null || modulo.getEstado() == null || !modulo.getEstado()
                || modulo.getCurso() == null || modulo.getCurso().getEstado() == null || !modulo.getCurso().getEstado()) {
            registrarDescargaDenegada(material, "Recurso inactivo");
            throw new com.insteip.backend.exception.ForbiddenException("No tiene permisos para acceder a este recurso.");
        }

        if (!isAdmin) {
            Matricula matricula = matriculaRepository.findByUsuarioIdAndCursoId(usuario.getId(), modulo.getCurso().getId())
                    .orElse(null);
            if (matricula == null || matricula.getEstado() == null || !matricula.getEstado()) {
                registrarDescargaDenegada(material, "Matrícula inactiva o inexistente");
                throw new com.insteip.backend.exception.ForbiddenException("No tiene permisos para acceder a este recurso.");
            }
        }

        try {
            if (material.getArchivoInterno() == null || material.getArchivoInterno().isBlank()) {
                registrarDescargaDenegada(material, "Archivo interno no configurado");
                throw new ResourceNotFoundException("Archivo físico no encontrado en el servidor para el material id: " + id);
            }

            Path filePath = Paths.get(UPLOADS_DIR).resolve(material.getArchivoInterno());
            if (!Files.exists(filePath)) {
                registrarDescargaDenegada(material, "Archivo físico no encontrado");
                throw new ResourceNotFoundException("Archivo físico no encontrado en el servidor para el material id: " + id);
            }
            byte[] bytes = Files.readAllBytes(filePath);
            auditoriaService.registrarEvento("MATERIAL", "DESCARGA_EXITOSA", "Descargado material: " + material.getNombre() + " (ID: " + material.getId() + ")");
            return bytes;
        } catch (IOException e) {
            registrarDescargaDenegada(material, "Error al leer el archivo físico");
            throw new ResourceNotFoundException("Archivo físico no encontrado en el servidor para el material id: " + id);
        }
    }

    private void validarArchivo(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new BadRequestException("El archivo es obligatorio");
        }

        // 1. Max 10MB Check
        if (archivo.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("El tamaño del archivo no puede superar los 10MB");
        }

        // 2. Block executables by extension and mime type
        String originalFilename = archivo.getOriginalFilename();
        if (originalFilename != null) {
            String lowerName = originalFilename.toLowerCase();
            if (lowerName.endsWith(".exe") || lowerName.endsWith(".bat") || lowerName.endsWith(".sh") ||
                lowerName.endsWith(".cmd") || lowerName.endsWith(".msi") || lowerName.endsWith(".com") ||
                lowerName.endsWith(".vbs") || lowerName.endsWith(".scr") || lowerName.endsWith(".pif")) {
                throw new BadRequestException("Los archivos ejecutables no están permitidos");
            }

            boolean hasAllowedExtension = ALLOWED_EXTENSIONS.stream().anyMatch(lowerName::endsWith);
            if (!hasAllowedExtension) {
                throw new BadRequestException("Tipo de archivo no permitido. Solo se admiten PDF, DOC, DOCX, PNG y JPG");
            }
        }

        String contentType = archivo.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Tipo MIME no permitido. Solo se admiten PDF, DOC, DOCX, PNG y JPG");
        }

        if (originalFilename != null) {
            String lowerName = originalFilename.toLowerCase();
            if (lowerName.contains("..") || lowerName.contains("/") || lowerName.contains("\\")
                    || lowerName.contains("<") || lowerName.contains(">")
                    || lowerName.contains("\"") || lowerName.contains("'")
                    || lowerName.contains(";")) {
                throw new BadRequestException("El nombre del archivo contiene caracteres no permitidos");
            }
        }
    }

    private String getCleanContentType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null && ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            return contentType.toLowerCase();
        }

        String name = file.getOriginalFilename();
        if (name != null) {
            String lowerName = name.toLowerCase();
            if (lowerName.endsWith(".pdf")) return "application/pdf";
            if (lowerName.endsWith(".doc")) return "application/msword";
            if (lowerName.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) return "image/jpeg";
            if (lowerName.endsWith(".png")) return "image/png";
        }
        return "application/octet-stream";
    }

    private String obtenerExtensionSegura(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new BadRequestException("El nombre del archivo es obligatorio");
        }
        String lowerName = originalFilename.toLowerCase();
        if (lowerName.endsWith(".pdf")) return ".pdf";
        if (lowerName.endsWith(".doc")) return ".doc";
        if (lowerName.endsWith(".docx")) return ".docx";
        if (lowerName.endsWith(".png")) return ".png";
        if (lowerName.endsWith(".jpg")) return ".jpg";
        if (lowerName.endsWith(".jpeg")) return ".jpg";
        throw new BadRequestException("Tipo de archivo no permitido. Solo se admiten PDF, DOC, DOCX, PNG y JPG");
    }

    private void registrarDescargaDenegada(Material material, String motivo) {
        auditoriaService.registrarEvento(
                "MATERIAL",
                "DESCARGA_DENEGADA",
                "Descarga denegada para material ID: " + material.getId() + ". Motivo: " + motivo
        );
    }

    private MaterialResponseDTO convertToResponseDto(Material m) {
        return new MaterialResponseDTO(
                m.getId(),
                m.getNombre(),
                m.getArchivoUrl(),
                m.getTipoArchivo(),
                m.getPesoBytes(),
                m.getEstado(),
                m.getFechaSubida()
        );
    }
}
