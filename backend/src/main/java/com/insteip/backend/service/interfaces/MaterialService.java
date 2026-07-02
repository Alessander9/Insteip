package com.insteip.backend.service.interfaces;

import com.insteip.backend.dto.MaterialResponseDTO;
import com.insteip.backend.entity.Material;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface MaterialService {
    List<MaterialResponseDTO> listarMaterialesPorModulo(Long moduloId);
    MaterialResponseDTO crearMaterial(Long moduloId, String nombre, MultipartFile archivo);
    MaterialResponseDTO editarMaterial(Long id, String nombre, MultipartFile archivo);
    void cambiarEstado(Long id, Boolean estado);
    Material obtenerMaterialEntity(Long id);
    byte[] descargarMaterialBytes(Long id);
}
