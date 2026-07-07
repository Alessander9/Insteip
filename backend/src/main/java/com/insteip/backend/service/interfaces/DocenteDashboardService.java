package com.insteip.backend.service.interfaces;

import com.insteip.backend.dto.CursoResponseDTO;
import com.insteip.backend.dto.DocenteEstudianteProgressResponse;
import java.util.List;

public interface DocenteDashboardService {
    List<CursoResponseDTO> getCursosAsignados(String correo);
    List<DocenteEstudianteProgressResponse> getAlumnosCurso(String correo, Long cursoId);
}
