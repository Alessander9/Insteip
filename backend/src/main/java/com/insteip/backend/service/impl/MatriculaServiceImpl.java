package com.insteip.backend.service.impl;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.dto.matricula.MatriculaRequestDTO;
import com.insteip.backend.domain.dto.matricula.MatriculaResponseDTO;
import com.insteip.backend.domain.entity.Curso;
import com.insteip.backend.domain.entity.Matricula;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.CursoRepository;
import com.insteip.backend.repository.MatriculaRepository;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.MatriculaService;
import com.insteip.backend.service.interfaces.AuditoriaService;
import com.insteip.backend.service.interfaces.NotificacionService;
import com.insteip.backend.domain.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatriculaServiceImpl implements MatriculaService {

    private final MatriculaRepository matriculaRepository;

    private final UsuarioRepository usuarioRepository;

    private final CursoRepository cursoRepository;

    private final AuditoriaService auditoriaService;

    private final NotificacionService notificacionService;

    @Override
    @Transactional
    public MatriculaResponseDTO matricularAlumno(MatriculaRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.usuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + dto.usuarioId()));

        Curso curso = cursoRepository.findById(dto.cursoId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id: " + dto.cursoId()));

        // Check if already enrolled
        if (matriculaRepository.existsByUsuarioIdAndCursoId(dto.usuarioId(), dto.cursoId())) {
            throw new BadRequestException("El alumno ya se encuentra matriculado en este curso.");
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

        notificacionService.crearNotificacion(
                usuario.getId(),
                "🔑 Matrícula Habilitada",
                "¡Bienvenido al curso '" + curso.getNombre() + "'! Ya tienes acceso completo a todos los módulos y clases.",
                "MATRICULA_NUEVA",
                "/dashboard/cursos-play/" + curso.getId(),
                "auto_stories"
        );

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatriculaResponseDTO> listarMatriculadosPorCurso(Long cursoId) {
        return matriculaRepository.findByCursoId(cursoId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatriculaResponseDTO> listarMatriculadosPorUsuario(Long usuarioId) {
        return matriculaRepository.findByUsuarioId(usuarioId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cambiarEstado(Long matriculaId, Boolean estado) {
        Matricula matricula = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula no encontrada con id: " + matriculaId));
        matricula.setEstado(estado);
        Matricula saved = matriculaRepository.save(matricula);
        auditoriaService.registrarEvento("MATRICULAS", estado ? "REACTIVAR" : "DAR_DE_BAJA", 
                (estado ? "Reactivada" : "Dada de baja") + " matrícula ID: " + saved.getId() + " para alumno ID: " + saved.getUsuario().getId() + " en curso ID: " + saved.getCurso().getId());
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Matricula matricula = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula no encontrada con id: " + id));

        String info = "Matrícula ID: " + id + " | Alumno: " + matricula.getUsuario().getNombres() + " " + matricula.getUsuario().getApellidos()
                + " | Curso: " + matricula.getCurso().getNombre();

        matriculaRepository.deleteById(id);
        auditoriaService.registrarEvento("MATRICULAS", "ELIMINAR", "Eliminada físicamente " + info);
    }

    private MatriculaResponseDTO toResponse(Matricula m) {
        LocalDateTime fMatricula = m.getFechaMatricula() != null ? m.getFechaMatricula() : LocalDateTime.now();
        LocalDateTime fExpiracion = m.getFechaExpiracion() != null ? m.getFechaExpiracion() : fMatricula.plusMonths(12);
        
        long diasRestantes = java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), fExpiracion);
        String alerta = "OK";
        if (diasRestantes <= 0) {
            alerta = "EXPIRADO";
        } else if (diasRestantes <= 7) {
            alerta = "URGENTE_7_DIAS";
        } else if (diasRestantes <= 30) {
            alerta = "PROXIMO_30_DIAS";
        }

        String docenteNombre = null;
        if (m.getCurso() != null && m.getCurso().getDocente() != null) {
            docenteNombre = m.getCurso().getDocente().getNombres() + " " + m.getCurso().getDocente().getApellidos();
        }

        return new MatriculaResponseDTO(
                m.getId(),
                m.getUsuario().getId(),
                m.getUsuario().getNombres(),
                m.getUsuario().getApellidos(),
                m.getUsuario().getCorreo(),
                m.getUsuario().getTelefono(),
                m.getCurso().getId(),
                m.getCurso().getNombre(),
                docenteNombre,
                fMatricula,
                fExpiracion,
                diasRestantes,
                alerta,
                m.getEstado()
        );
    }


}
