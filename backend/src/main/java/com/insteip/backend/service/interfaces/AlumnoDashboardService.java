package com.insteip.backend.service.interfaces;

import com.insteip.backend.dto.*;
import java.util.List;

public interface AlumnoDashboardService {
    AlumnoDashboardMetrics getMetrics(String correo);
    List<AlumnoCursoResponse> getEnrolledCursos(String correo);
    List<AlumnoCertificadoResponse> getCertificados(String correo);
    AlumnoPlayCourseResponse getPlayCourse(String correo, Long cursoId);
}
