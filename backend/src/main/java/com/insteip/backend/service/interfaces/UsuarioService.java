package com.insteip.backend.service.interfaces;

import com.insteip.backend.dto.UsuarioRequestDTO;
import com.insteip.backend.dto.UsuarioResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UsuarioService {
    Page<UsuarioResponseDTO> listarAlumnos(Pageable pageable, String search);
    UsuarioResponseDTO obtenerAlumno(Long id);
    UsuarioResponseDTO crearAlumno(UsuarioRequestDTO dto);
    UsuarioResponseDTO editarAlumno(Long id, UsuarioRequestDTO dto);
    void cambiarEstado(Long id, Boolean estado);
}
