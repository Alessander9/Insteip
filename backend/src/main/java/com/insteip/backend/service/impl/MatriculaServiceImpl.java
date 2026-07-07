package com.insteip.backend.service.impl;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.dto.MatriculaRequestDTO;
import com.insteip.backend.dto.MatriculaResponseDTO;
import com.insteip.backend.entity.Curso;
import com.insteip.backend.entity.Matricula;
import com.insteip.backend.entity.Usuario;
import com.insteip.backend.exception.ResourceNotFoundException;
import com.insteip.backend.repository.CursoRepository;
import com.insteip.backend.repository.MatriculaRepository;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.MatriculaService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatriculaServiceImpl implements MatriculaService {

    private final MatriculaRepository matriculaRepository;

    private final UsuarioRepository usuarioRepository;

    private final CursoRepository cursoRepository;

    private final com.insteip.backend.service.interfaces.AuditoriaService auditoriaService;

    @Override
    public MatriculaResponseDTO matricularAlumno(MatriculaRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.usuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + dto.usuarioId()));

        Curso curso = cursoRepository.findById(dto.cursoId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id: " + dto.cursoId()));

        // Check if already enrolled
        if (matriculaRepository.existsByUsuarioIdAndCursoId(dto.usuarioId(), dto.cursoId())) {
            throw new RuntimeException("El alumno ya está matriculado en este curso.");
        }

        // Check if user's subscription level is allowed for the course
        if (usuario.getNivelSuscripcion() == null || curso.getNivelesSuscripcion() == null ||
                !curso.getNivelesSuscripcion().contains(usuario.getNivelSuscripcion())) {
            throw new RuntimeException("El alumno no cuenta con el nivel de suscripción requerido para este curso.");
        }

        Matricula matricula = Matricula.builder()
                .usuario(usuario)
                .curso(curso)
                .estado(true)
                .build();

        Matricula saved = matriculaRepository.save(matricula);
        auditoriaService.registrarEvento("MATRICULA", "CREAR", "Matriculado alumno ID: " + saved.getUsuario().getId() + " (" + saved.getUsuario().getCorreo() + ") en curso ID: " + saved.getCurso().getId() + " (" + saved.getCurso().getNombre() + ")");
        return toResponse(saved);
    }

    @Override
    public List<MatriculaResponseDTO> listarMatriculadosPorCurso(Long cursoId) {
        return matriculaRepository.findByCursoId(cursoId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void cambiarEstado(Long matriculaId, Boolean estado) {
        Matricula matricula = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula no encontrada con id: " + matriculaId));
        matricula.setEstado(estado);
        Matricula saved = matriculaRepository.save(matricula);
        auditoriaService.registrarEvento("MATRICULAS", estado ? "REACTIVAR" : "DAR_DE_BAJA", 
                (estado ? "Reactivada" : "Dada de baja") + " matrícula ID: " + saved.getId() + " para alumno ID: " + saved.getUsuario().getId() + " en curso ID: " + saved.getCurso().getId());
    }

    private MatriculaResponseDTO toResponse(Matricula m) {
        return new MatriculaResponseDTO(
                m.getId(),
                m.getUsuario().getId(),
                m.getUsuario().getNombres(),
                m.getUsuario().getApellidos(),
                m.getUsuario().getCorreo(),
                m.getCurso().getId(),
                m.getCurso().getNombre(),
                m.getFechaMatricula(),
                m.getEstado()
        );
    }
}
