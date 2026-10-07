package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.matricula.ActualizarAccesosRequestDTO;
import com.insteip.backend.domain.dto.matricula.ModuloAccesoDTO;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.AuditoriaService;
import com.insteip.backend.service.interfaces.NotificacionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatriculaServiceImplTest {

    @Mock private MatriculaRepository matriculaRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private CursoRepository cursoRepository;
    @Mock private ModuloRepository moduloRepository;
    @Mock private VideoRepository videoRepository;
    @Mock private MaterialRepository materialRepository;
    @Mock private MatriculaModuloAccesoRepository matriculaModuloAccesoRepository;
    @Mock private MatriculaVideoAccesoRepository matriculaVideoAccesoRepository;
    @Mock private MatriculaMaterialAccesoRepository matriculaMaterialAccesoRepository;
    @Mock private AuditoriaService auditoriaService;
    @Mock private NotificacionService notificacionService;

    @InjectMocks
    private MatriculaServiceImpl matriculaService;

    private Usuario usuario;
    private Curso curso;
    private Matricula matricula;
    private Modulo modulo1;
    private Modulo modulo2;
    private Video video1;
    private Video video2;
    private Material material1;

    @BeforeEach
    void setUp() {
        usuario = Usuario.builder()
                .id(1L)
                .nombres("Juan")
                .apellidos("Pérez")
                .correo("juan@example.com")
                .build();

        curso = Curso.builder()
                .id(10L)
                .nombre("Curso de Acupuntura")
                .build();

        matricula = Matricula.builder()
                .id(100L)
                .usuario(usuario)
                .curso(curso)
                .fechaMatricula(LocalDateTime.now().minusDays(10))
                .estado(true)
                .build();

        modulo1 = Modulo.builder()
                .id(501L)
                .nombre("Módulo 1")
                .orden(1)
                .curso(curso)
                .estado(true)
                .build();

        modulo2 = Modulo.builder()
                .id(502L)
                .nombre("Módulo 2")
                .orden(2)
                .curso(curso)
                .estado(true)
                .build();

        video1 = Video.builder()
                .id(901L)
                .titulo("Video 1.1")
                .orden(1)
                .modulo(modulo1)
                .estado(true)
                .build();

        video2 = Video.builder()
                .id(902L)
                .titulo("Video 1.2")
                .orden(2)
                .modulo(modulo1)
                .estado(true)
                .build();

        material1 = Material.builder()
                .id(801L)
                .nombre("Guía de Estudio.pdf")
                .modulo(modulo1)
                .archivoUrl("https://api.insteip.com/api/materiales/801/download")
                .archivoInterno("guia-801.pdf")
                .tipoArchivo("application/pdf")
                .pesoBytes(1024L)
                .estado(true)
                .build();
    }

    @Test
    @DisplayName("listarModulosAcceso - Retorna todos los módulos, videos y materiales habilitados por defecto si no hay restricciones")
    void testListarModulosAccesoSinRestricciones() {
        when(matriculaRepository.findById(100L)).thenReturn(Optional.of(matricula));
        when(moduloRepository.findByCursoIdOrderByOrdenAsc(10L)).thenReturn(List.of(modulo1, modulo2));
        when(matriculaModuloAccesoRepository.findByMatriculaId(100L)).thenReturn(List.of());
        when(matriculaVideoAccesoRepository.findByMatriculaId(100L)).thenReturn(List.of());
        when(matriculaMaterialAccesoRepository.findByMatriculaId(100L)).thenReturn(List.of());
        when(videoRepository.findByModuloIdOrderByOrdenAsc(501L)).thenReturn(List.of(video1, video2));
        when(videoRepository.findByModuloIdOrderByOrdenAsc(502L)).thenReturn(List.of());
        when(materialRepository.findByModuloId(501L)).thenReturn(List.of(material1));
        when(materialRepository.findByModuloId(502L)).thenReturn(List.of());

        List<ModuloAccesoDTO> resultado = matriculaService.listarModulosAcceso(100L);

        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        assertTrue(resultado.get(0).habilitado());
        assertEquals(2, resultado.get(0).videos().size());
        assertTrue(resultado.get(0).videos().get(0).habilitado());
        assertTrue(resultado.get(0).videos().get(1).habilitado());
        assertEquals(1, resultado.get(0).materiales().size());
        assertTrue(resultado.get(0).materiales().get(0).habilitado());
        assertTrue(resultado.get(1).habilitado());
    }

    @Test
    @DisplayName("listarModulosAcceso - Refleja restricciones explícitas de módulo, video y material")
    void testListarModulosAccesoConRestricciones() {
        when(matriculaRepository.findById(100L)).thenReturn(Optional.of(matricula));
        when(moduloRepository.findByCursoIdOrderByOrdenAsc(10L)).thenReturn(List.of(modulo1));
        
        MatriculaModuloAcceso accMod = MatriculaModuloAcceso.builder()
                .matricula(matricula)
                .modulo(modulo1)
                .habilitado(true)
                .build();
        when(matriculaModuloAccesoRepository.findByMatriculaId(100L)).thenReturn(List.of(accMod));

        MatriculaVideoAcceso accVid = MatriculaVideoAcceso.builder()
                .matricula(matricula)
                .video(video2)
                .habilitado(false)
                .build();
        when(matriculaVideoAccesoRepository.findByMatriculaId(100L)).thenReturn(List.of(accVid));

        MatriculaMaterialAcceso accMat = MatriculaMaterialAcceso.builder()
                .matricula(matricula)
                .material(material1)
                .habilitado(false)
                .build();
        when(matriculaMaterialAccesoRepository.findByMatriculaId(100L)).thenReturn(List.of(accMat));

        when(videoRepository.findByModuloIdOrderByOrdenAsc(501L)).thenReturn(List.of(video1, video2));
        when(materialRepository.findByModuloId(501L)).thenReturn(List.of(material1));

        List<ModuloAccesoDTO> resultado = matriculaService.listarModulosAcceso(100L);

        assertEquals(1, resultado.size());
        assertTrue(resultado.get(0).habilitado());
        assertEquals(2, resultado.get(0).videos().size());
        assertTrue(resultado.get(0).videos().get(0).habilitado()); // Hereda módulo = true
        assertFalse(resultado.get(0).videos().get(1).habilitado()); // Restringido explícitamente = false
        assertEquals(1, resultado.get(0).materiales().size());
        assertFalse(resultado.get(0).materiales().get(0).habilitado()); // Restringido explícitamente = false
    }

    @Test
    @DisplayName("actualizarVideoAcceso - Actualiza o crea registro de restricción de video")
    void testActualizarVideoAccesoExitoso() {
        when(matriculaRepository.findById(100L)).thenReturn(Optional.of(matricula));
        when(videoRepository.findById(901L)).thenReturn(Optional.of(video1));
        when(matriculaVideoAccesoRepository.findByMatriculaIdAndVideoId(100L, 901L)).thenReturn(Optional.empty());

        matriculaService.actualizarVideoAcceso(100L, 901L, false);

        ArgumentCaptor<MatriculaVideoAcceso> captor = ArgumentCaptor.forClass(MatriculaVideoAcceso.class);
        verify(matriculaVideoAccesoRepository).save(captor.capture());
        MatriculaVideoAcceso guardado = captor.getValue();
        assertFalse(guardado.getHabilitado());
        assertEquals(matricula, guardado.getMatricula());
        assertEquals(video1, guardado.getVideo());
        verify(auditoriaService).registrarEvento(eq("MATRICULAS"), eq("VIDEO_ACCESO_MODIFICADO"), anyString());
    }

    @Test
    @DisplayName("actualizarMaterialAcceso - Actualiza o crea registro de restricción de material")
    void testActualizarMaterialAccesoExitoso() {
        when(matriculaRepository.findById(100L)).thenReturn(Optional.of(matricula));
        when(materialRepository.findById(801L)).thenReturn(Optional.of(material1));
        when(matriculaMaterialAccesoRepository.findByMatriculaIdAndMaterialId(100L, 801L)).thenReturn(Optional.empty());

        matriculaService.actualizarMaterialAcceso(100L, 801L, false);

        ArgumentCaptor<MatriculaMaterialAcceso> captor = ArgumentCaptor.forClass(MatriculaMaterialAcceso.class);
        verify(matriculaMaterialAccesoRepository).save(captor.capture());
        MatriculaMaterialAcceso guardado = captor.getValue();
        assertFalse(guardado.getHabilitado());
        assertEquals(matricula, guardado.getMatricula());
        assertEquals(material1, guardado.getMaterial());
        verify(auditoriaService).registrarEvento(eq("MATRICULAS"), eq("MATERIAL_ACCESO_MODIFICADO"), anyString());
    }

    @Test
    @DisplayName("actualizarMaterialAcceso - Lanza BadRequestException si el material no pertenece al curso")
    void testActualizarMaterialAccesoCursoInvalido() {
        Curso otroCurso = Curso.builder().id(999L).nombre("Otro").build();
        Modulo otroModulo = Modulo.builder().id(888L).curso(otroCurso).build();
        Material materialOtroCurso = Material.builder().id(777L).modulo(otroModulo).build();

        when(matriculaRepository.findById(100L)).thenReturn(Optional.of(matricula));
        when(materialRepository.findById(777L)).thenReturn(Optional.of(materialOtroCurso));

        assertThrows(BadRequestException.class, () -> matriculaService.actualizarMaterialAcceso(100L, 777L, true));
        verify(matriculaMaterialAccesoRepository, never()).save(any());
    }

    @Test
    @DisplayName("actualizarVideoAcceso - Lanza BadRequestException si el video no pertenece al curso")
    void testActualizarVideoAccesoCursoInvalido() {
        Curso otroCurso = Curso.builder().id(999L).nombre("Otro").build();
        Modulo otroModulo = Modulo.builder().id(888L).curso(otroCurso).build();
        Video videoOtroCurso = Video.builder().id(777L).modulo(otroModulo).build();

        when(matriculaRepository.findById(100L)).thenReturn(Optional.of(matricula));
        when(videoRepository.findById(777L)).thenReturn(Optional.of(videoOtroCurso));

        assertThrows(BadRequestException.class, () -> matriculaService.actualizarVideoAcceso(100L, 777L, true));
        verify(matriculaVideoAccesoRepository, never()).save(any());
    }

    @Test
    @DisplayName("actualizarAccesosMasivo - Guarda masivamente módulos, videos y materiales")
    void testActualizarAccesosMasivo() {
        when(matriculaRepository.findById(100L)).thenReturn(Optional.of(matricula));
        when(moduloRepository.findByCursoIdOrderByOrdenAsc(10L)).thenReturn(List.of(modulo1));
        when(videoRepository.findByModuloIdOrderByOrdenAsc(501L)).thenReturn(List.of(video1, video2));
        when(materialRepository.findByModuloId(501L)).thenReturn(List.of(material1));
        when(matriculaModuloAccesoRepository.findByMatriculaId(100L)).thenReturn(List.of());
        when(matriculaVideoAccesoRepository.findByMatriculaId(100L)).thenReturn(List.of());
        when(matriculaMaterialAccesoRepository.findByMatriculaId(100L)).thenReturn(List.of());

        ActualizarAccesosRequestDTO request = new ActualizarAccesosRequestDTO(
                List.of(501L),
                List.of(901L),
                List.of(801L)
        );

        matriculaService.actualizarAccesosMasivo(100L, request);

        verify(matriculaModuloAccesoRepository).saveAll(anyList());
        verify(matriculaVideoAccesoRepository).saveAll(anyList());
        verify(matriculaMaterialAccesoRepository).saveAll(anyList());
        verify(auditoriaService).registrarEvento(eq("MATRICULAS"), eq("ACCESOS_COMPLETOS_MASIVO"), anyString());
    }

    @Test
    @DisplayName("eliminar - Limpia en cascada accesos de videos, materiales y módulos")
    void testEliminarMatriculaCascada() {
        when(matriculaRepository.findById(100L)).thenReturn(Optional.of(matricula));

        matriculaService.eliminar(100L);

        verify(matriculaVideoAccesoRepository).deleteByMatriculaId(100L);
        verify(matriculaMaterialAccesoRepository).deleteByMatriculaId(100L);
        verify(matriculaModuloAccesoRepository).deleteByMatriculaId(100L);
        verify(matriculaRepository).deleteById(100L);
    }
}
