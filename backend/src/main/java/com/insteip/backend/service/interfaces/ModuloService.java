package com.insteip.backend.service.interfaces;

import com.insteip.backend.dto.ModuloRequestDTO;
import com.insteip.backend.dto.ModuloResponseDTO;
import java.util.List;

public interface ModuloService {
    List<ModuloResponseDTO> listarModulosPorCurso(Long cursoId);
    ModuloResponseDTO obtenerModulo(Long id);
    ModuloResponseDTO crearModulo(ModuloRequestDTO dto);
    ModuloResponseDTO editarModulo(Long id, ModuloRequestDTO dto);
    void cambiarEstado(Long id, Boolean estado);
}
