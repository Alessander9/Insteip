package com.insteip.backend.service.impl;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.dto.CursoResponseDTO;
import com.insteip.backend.dto.DocenteEstudianteProgressResponse;
import com.insteip.backend.entity.*;
import com.insteip.backend.exception.ForbiddenException;
import com.insteip.backend.exception.ResourceNotFoundException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.DocenteDashboardService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocenteDashboardServiceImpl implements DocenteDashboardService {

    private final UsuarioRepository usuarioRepository;

    private final CursoRepository cursoRepository;

    private final MatriculaRepository matriculaRepository;

    private final AvanceCursoRepository avanceCursoRepository;

    @Override
    public List<CursoResponseDTO> getCursosAsignados(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con correo: " + correo));

        List<Curso> cursos;
        if ("ADMINISTRADOR".equalsIgnoreCase(usuario.getRol().getNombre())) {
            cursos = cursoRepository.findAll();
        } else {
            cursos = cursoRepository.findByDocenteId(usuario.getId());
        }

        return cursos.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<DocenteEstudianteProgressResponse> getAlumnosCurso(String correo, Long cursoId) {
        Usuario docente = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con correo: " + correo));

        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id: " + cursoId));

        if (!"ADMINISTRADOR".equalsIgnoreCase(docente.getRol().getNombre()) && 
            (curso.getDocente() == null || !curso.getDocente().getId().equals(docente.getId()))) {
            throw new ForbiddenException("No tiene permisos para ver los alumnos de este curso.");
        }

        List<Matricula> matriculas = matriculaRepository.findByCursoId(cursoId);

        return matriculas.stream()
                .map(m -> {
                    Usuario estudiante = m.getUsuario();
                    AvanceCurso avance = avanceCursoRepository.findByUsuarioIdAndCursoId(estudiante.getId(), cursoId).orElse(null);
                    
                    Double porcentaje = avance != null && avance.getPorcentajeAvance() != null 
                            ? avance.getPorcentajeAvance().doubleValue() 
                            : 0.0;
                    Boolean completado = avance != null && avance.getCompletado() != null 
                            ? avance.getCompletado() 
                            : false;
                    java.time.LocalDateTime fecha = avance != null ? avance.getFechaActualizacion() : m.getFechaMatricula();

                    return new DocenteEstudianteProgressResponse(
                            estudiante.getId(),
                            estudiante.getNombres(),
                            estudiante.getApellidos(),
                            estudiante.getCorreo(),
                            porcentaje,
                            completado,
                            fecha
                    );
                })
                .collect(Collectors.toList());
    }

    private CursoResponseDTO convertToResponseDto(Curso c) {
        Long docenteId = c.getDocente() != null ? c.getDocente().getId() : null;
        String docenteNombre = c.getDocente() != null ? (c.getDocente().getNombres() + " " + c.getDocente().getApellidos()) : null;
        return new CursoResponseDTO(
                c.getId(),
                c.getNombre(),
                c.getDescripcion(),
                c.getImagenPortada(),
                c.getNivelesSuscripcion().stream().map(NivelSuscripcion::getNombre).collect(Collectors.toList()),
                c.getEstado(),
                docenteId,
                docenteNombre
        );
    }
}
