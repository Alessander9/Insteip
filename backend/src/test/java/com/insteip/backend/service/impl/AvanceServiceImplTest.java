package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.avance.AvanceProgressRequest;
import com.insteip.backend.domain.dto.avance.AvanceProgressResponse;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.CertificadoService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AvanceServiceImplTest {

    @Mock private AvanceVideoRepository avanceVideoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private VideoRepository videoRepository;
    @Mock private AvanceCursoRepository avanceCursoRepository;
    @Mock private ModuloRepository moduloRepository;
    @Mock private MatriculaRepository matriculaRepository;
    @Mock private MatriculaModuloAccesoRepository matriculaModuloAccesoRepository;
    @Mock private MatriculaVideoAccesoRepository matriculaVideoAccesoRepository;
    @Mock private EntityManager entityManager;
    @Mock private CertificadoService certificadoService;

    @InjectMocks
    private AvanceServiceImpl avanceService;

    private Usuario usuario;
    private Curso curso;
    private Modulo modulo;
    private Video video;
    private Matricula matricula;

    @BeforeEach
    void setUp() {
        usuario = Usuario.builder().id(1L).correo("alumno@test.com").build();
        curso = Curso.builder().id(10L).nombre("Curso 1").build();
        modulo = Modulo.builder().id(50L).nombre("Módulo 1").curso(curso).estado(true).build();
        video = Video.builder().id(100L).titulo("Video 1").modulo(modulo).duracionSegundos(600).estado(true).build();
        matricula = Matricula.builder().id(500L).usuario(usuario).curso(curso).estado(true).build();
    }

    @Test
    @DisplayName("guardarProgreso - Lanza BadRequestException si el video está explícitamente restringido")
    void testGuardarProgresoVideoRestringido() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(videoRepository.findById(100L)).thenReturn(Optional.of(video));
        when(matriculaRepository.findByUsuarioIdAndCursoId(1L, 10L)).thenReturn(Optional.of(matricula));
        when(matriculaModuloAccesoRepository.existsByMatriculaId(500L)).thenReturn(false);

        MatriculaVideoAcceso accVideo = MatriculaVideoAcceso.builder()
                .matricula(matricula)
                .video(video)
                .habilitado(false)
                .build();
        when(matriculaVideoAccesoRepository.findByMatriculaIdAndVideoId(500L, 100L)).thenReturn(Optional.of(accVideo));

        AvanceProgressRequest request = new AvanceProgressRequest(100L, 120, 600);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> avanceService.guardarProgreso(1L, request));
        assertEquals("No tienes acceso habilitado a este video.", ex.getMessage());
        verify(avanceVideoRepository, never()).save(any());
    }

    @Test
    @DisplayName("guardarProgreso - Lanza BadRequestException si el módulo padre está bloqueado")
    void testGuardarProgresoModuloBloqueado() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(videoRepository.findById(100L)).thenReturn(Optional.of(video));
        when(matriculaRepository.findByUsuarioIdAndCursoId(1L, 10L)).thenReturn(Optional.of(matricula));
        when(matriculaModuloAccesoRepository.existsByMatriculaId(500L)).thenReturn(true);
        when(matriculaModuloAccesoRepository.existsByMatriculaIdAndModuloIdAndHabilitadoTrue(500L, 50L)).thenReturn(false);

        AvanceProgressRequest request = new AvanceProgressRequest(100L, 120, 600);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> avanceService.guardarProgreso(1L, request));
        assertEquals("No tienes acceso habilitado al módulo correspondiente a este video.", ex.getMessage());
        verify(avanceVideoRepository, never()).save(any());
    }

    @Test
    @DisplayName("guardarProgreso - Guarda progreso exitosamente si el video y módulo están habilitados")
    void testGuardarProgresoExitoso() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(videoRepository.findById(100L)).thenReturn(Optional.of(video));
        when(matriculaRepository.findByUsuarioIdAndCursoId(1L, 10L)).thenReturn(Optional.of(matricula));
        when(matriculaModuloAccesoRepository.existsByMatriculaId(500L)).thenReturn(false);
        when(matriculaVideoAccesoRepository.findByMatriculaIdAndVideoId(500L, 100L)).thenReturn(Optional.empty());

        AvanceVideo mockAvance = AvanceVideo.builder()
                .usuario(usuario)
                .video(video)
                .ultimoSegundo(300)
                .porcentajeVisto(BigDecimal.valueOf(50.00))
                .completado(false)
                .build();

        when(avanceVideoRepository.findByUsuarioIdAndVideoId(1L, 100L)).thenReturn(Optional.of(mockAvance));
        when(avanceVideoRepository.save(any(AvanceVideo.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(moduloRepository.findByCursoIdOrderByOrdenAsc(10L)).thenReturn(List.of(modulo));
        when(videoRepository.findByModuloIdOrderByOrdenAsc(50L)).thenReturn(List.of(video));

        AvanceProgressRequest request = new AvanceProgressRequest(100L, 300, 600);

        AvanceProgressResponse response = avanceService.guardarProgreso(1L, request);

        assertNotNull(response);
        assertEquals(100L, response.getVideoId());
        assertEquals(300, response.getUltimoSegundo());
        verify(avanceVideoRepository).save(any(AvanceVideo.class));
    }
}
