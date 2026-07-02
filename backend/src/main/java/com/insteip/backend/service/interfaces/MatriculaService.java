package com.insteip.backend.service.interfaces;

import com.insteip.backend.dto.MatriculaRequestDTO;
import com.insteip.backend.dto.MatriculaResponseDTO;
import java.util.List;

public interface MatriculaService {
    MatriculaResponseDTO matricularAlumno(MatriculaRequestDTO dto);
    List<MatriculaResponseDTO> listarMatriculadosPorCurso(Long cursoId);
    void cambiarEstado(Long matriculaId, Boolean estado);
}
