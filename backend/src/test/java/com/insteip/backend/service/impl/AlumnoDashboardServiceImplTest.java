package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.alumno.AlumnoPlayCourseResponse;
import com.insteip.backend.domain.dto.alumno.AlumnoPlayModulo;
import com.insteip.backend.domain.dto.alumno.AlumnoPlayVideo;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlumnoDashboardServiceImplTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private MatriculaRepository matriculaRepository;
    @Mock private CertificadoRepository certificadoRepository;
    @Mock private MatriculaModuloAccesoRepository matriculaModuloAccesoRepository;
    @Mock private MatriculaVideoAccesoRepository matriculaVideoAccesoRepository;
    @Mock private MatriculaMaterialAccesoRepository matriculaMaterialAccesoRepository;
    @Mock private CursoRepository cursoRepository;
    @Mock private ModuloRepository moduloRepository;
    @Mock private VideoRepository videoRepository;
    @Mock private MaterialRepository materialRepository;
    @Mock private AvanceVideoRepository avanceVideoRepository;
    @Mock private AvanceCursoRepository avanceCursoRepository;

    @InjectMocks
    private AlumnoDashboardServiceImpl alumnoDashboardService;

    private Usuario usuario;
    private Curso curso;
    private Modulo modulo;
    private Video video1;
    private Video video2;
    private Matricula matricula;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(alumnoDashboardService, "apiBaseUrl", "http://localhost:8080");
        ReflectionTestUtils.setField(alumnoDashboardService, "frontendBaseUrl", "http://localhost:4200");

        usuario = Usuario.builder().id(1L).correo("alumno@test.com").build();
        curso = Curso.builder().id(10L).nombre("Acupuntura").estado(true).build();
        modulo = Modulo.builder().id(50L).nombre("Módulo 1").curso(curso).orden(1).estado(true).build();
        video1 = Video.builder().id(101L).titulo("Video 1").youtubeUrl("https://youtube.com/v1").youtubeId("v1").modulo(modulo).orden(1).estado(true).build();
        video2 = Video.builder().id(102L).titulo("Video 2").youtubeUrl("https://youtube.com/v2").youtubeId("v2").modulo(modulo).orden(2).estado(true).build();
        matricula = Matricula.builder().id(500L).usuario(usuario).curso(curso).estado(true).fechaExpiracion(LocalDateTime.now().plusMonths(6)).build();
    }

    @Test
    @DisplayName("getPlayCourse - Oculta streaming URLs y marca bloqueado=true en videos con restricción")
    void testGetPlayCourseConVideoRestringido() {
        when(usuarioRepository.findByCorreo("alumno@test.com")).thenReturn(Optional.of(usuario));
        when(cursoRepository.findById(10L)).thenReturn(Optional.of(curso));
        when(matriculaRepository.findByUsuarioIdAndCursoId(1L, 10L)).thenReturn(Optional.of(matricula));
        when(matriculaModuloAccesoRepository.findByMatriculaId(500L)).thenReturn(List.of());

        MatriculaVideoAcceso accVideo2 = MatriculaVideoAcceso.builder()
                .matricula(matricula)
                .video(video2)
                .habilitado(false)
                .build();
        when(matriculaVideoAccesoRepository.findByMatriculaId(500L)).thenReturn(List.of(accVideo2));

        when(matriculaMaterialAccesoRepository.findByMatriculaId(500L)).thenReturn(List.of());

        when(moduloRepository.findByCursoIdOrderByOrdenAsc(10L)).thenReturn(List.of(modulo));
        when(avanceVideoRepository.findByUsuarioId(1L)).thenReturn(List.of());
        when(videoRepository.findByModuloIdOrderByOrdenAsc(50L)).thenReturn(List.of(video1, video2));
        when(materialRepository.findByModuloId(50L)).thenReturn(List.of());

        AlumnoPlayCourseResponse response = alumnoDashboardService.getPlayCourse("alumno@test.com", 10L);

        assertNotNull(response);
        assertEquals(1, response.modulos().size());
        AlumnoPlayModulo playMod = response.modulos().get(0);
        assertFalse(playMod.bloqueado());
        assertEquals(2, playMod.videos().size());

        AlumnoPlayVideo playV1 = playMod.videos().get(0);
        assertFalse(playV1.bloqueado());
        assertEquals("https://youtube.com/v1", playV1.youtubeUrl());
        assertEquals("v1", playV1.youtubeId());
        assertNull(playV1.mensajeBloqueo());

        AlumnoPlayVideo playV2 = playMod.videos().get(1);
        assertTrue(playV2.bloqueado());
        assertNull(playV2.youtubeUrl());
        assertNull(playV2.youtubeId());
        assertEquals("Video restringido por el administrador.", playV2.mensajeBloqueo());
    }

    @Test
    @DisplayName("getPlayCourse - Si el módulo está bloqueado, todos sus videos quedan bloqueados")
    void testGetPlayCourseConModuloBloqueado() {
        when(usuarioRepository.findByCorreo("alumno@test.com")).thenReturn(Optional.of(usuario));
        when(cursoRepository.findById(10L)).thenReturn(Optional.of(curso));
        when(matriculaRepository.findByUsuarioIdAndCursoId(1L, 10L)).thenReturn(Optional.of(matricula));

        MatriculaModuloAcceso accMod = MatriculaModuloAcceso.builder()
                .matricula(matricula)
                .modulo(modulo)
                .habilitado(false)
                .build();
        when(matriculaModuloAccesoRepository.findByMatriculaId(500L)).thenReturn(List.of(accMod));
        when(matriculaVideoAccesoRepository.findByMatriculaId(500L)).thenReturn(List.of());
        when(matriculaMaterialAccesoRepository.findByMatriculaId(500L)).thenReturn(List.of());

        when(moduloRepository.findByCursoIdOrderByOrdenAsc(10L)).thenReturn(List.of(modulo));
        when(avanceVideoRepository.findByUsuarioId(1L)).thenReturn(List.of());
        when(videoRepository.findByModuloIdOrderByOrdenAsc(50L)).thenReturn(List.of(video1, video2));
        when(materialRepository.findByModuloId(50L)).thenReturn(List.of());

        AlumnoPlayCourseResponse response = alumnoDashboardService.getPlayCourse("alumno@test.com", 10L);

        assertNotNull(response);
        AlumnoPlayModulo playMod = response.modulos().get(0);
        assertTrue(playMod.bloqueado());

        for (AlumnoPlayVideo v : playMod.videos()) {
            assertTrue(v.bloqueado());
            assertNull(v.youtubeUrl());
            assertNull(v.youtubeId());
            assertEquals("Módulo bloqueado o pendiente de pago.", v.mensajeBloqueo());
        }
    }

    @Test
    @DisplayName("getPlayCourse - Oculta archivoUrl y marca bloqueado=true en materiales con restricción")
    void testGetPlayCourseConMaterialRestringido() {
        when(usuarioRepository.findByCorreo("alumno@test.com")).thenReturn(Optional.of(usuario));
        when(cursoRepository.findById(10L)).thenReturn(Optional.of(curso));
        when(matriculaRepository.findByUsuarioIdAndCursoId(1L, 10L)).thenReturn(Optional.of(matricula));
        when(matriculaModuloAccesoRepository.findByMatriculaId(500L)).thenReturn(List.of());
        when(matriculaVideoAccesoRepository.findByMatriculaId(500L)).thenReturn(List.of());

        Material mat1 = Material.builder().id(201L).nombre("Guia 1.pdf").archivoUrl("https://storage/guia1.pdf").modulo(modulo).estado(true).build();
        Material mat2 = Material.builder().id(202L).nombre("Guia 2.pdf").archivoUrl("https://storage/guia2.pdf").modulo(modulo).estado(true).build();

        MatriculaMaterialAcceso accMat2 = MatriculaMaterialAcceso.builder()
                .matricula(matricula)
                .material(mat2)
                .habilitado(false)
                .build();
        when(matriculaMaterialAccesoRepository.findByMatriculaId(500L)).thenReturn(List.of(accMat2));

        when(moduloRepository.findByCursoIdOrderByOrdenAsc(10L)).thenReturn(List.of(modulo));
        when(avanceVideoRepository.findByUsuarioId(1L)).thenReturn(List.of());
        when(videoRepository.findByModuloIdOrderByOrdenAsc(50L)).thenReturn(List.of(video1));
        when(materialRepository.findByModuloId(50L)).thenReturn(List.of(mat1, mat2));

        AlumnoPlayCourseResponse response = alumnoDashboardService.getPlayCourse("alumno@test.com", 10L);

        assertNotNull(response);
        AlumnoPlayModulo playMod = response.modulos().get(0);
        assertEquals(2, playMod.materiales().size());

        com.insteip.backend.domain.dto.alumno.AlumnoPlayMaterial pMat1 = playMod.materiales().get(0);
        assertFalse(pMat1.bloqueado());
        assertNotNull(pMat1.archivoUrl());
        assertNull(pMat1.mensajeBloqueo());

        com.insteip.backend.domain.dto.alumno.AlumnoPlayMaterial pMat2 = playMod.materiales().get(1);
        assertTrue(pMat2.bloqueado());
        assertNull(pMat2.archivoUrl());
        assertEquals("Material de apoyo no habilitado para su matrícula.", pMat2.mensajeBloqueo());
    }
}
