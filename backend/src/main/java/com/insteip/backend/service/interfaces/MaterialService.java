package com.insteip.backend.service.interfaces;

import com.insteip.backend.dto.MaterialResponseDTO;
import com.insteip.backend.entity.Material;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MaterialService {
    List<MaterialResponseDTO> listarMaterialesPorModulo(Long moduloId);
    Page<MaterialResponseDTO> listarMaterialesPorModulo(Long moduloId, Pageable pageable);
    Page<MaterialResponseDTO> listarMaterialesPorModulo(Long moduloId, String search, Pageable pageable, boolean useSearch);
    MaterialResponseDTO crearMaterial(Long moduloId, String nombre, MultipartFile archivo);
    MaterialResponseDTO editarMaterial(Long id, String nombre, MultipartFile archivo);
    void cambiarEstado(Long id, Boolean estado);
    Material obtenerMaterialEntity(Long id);
    byte[] descargarMaterialBytes(Long id);
}
