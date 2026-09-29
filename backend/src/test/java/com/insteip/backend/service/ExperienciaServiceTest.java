package com.insteip.backend.service;

import com.insteip.backend.domain.dto.experiencia.*;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.domain.exception.ForbiddenException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.impl.ExperienciaServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExperienciaServiceTest {

    @Mock
    private ExperienciaUsoRepository experienciaUsoRepository;

    @Mock
    private CursoRepository cursoRepository;

    @Mock
    private ModuloRepository moduloRepository;

    @Mock
    private VideoRepository videoRepository;

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private HttpServletRequest httpRequest;

    @InjectMocks
    private ExperienciaServiceImpl experienciaService;

    private final String CORREO_TEST = "visitante@example.com";
    private final String COOKIE_TEST = "cookie-uuid-1234";
    private final String IP_TEST = "190.237.100.50";

    @BeforeEach
    void setUp() {
        lenient().when(httpRequest.getHeader("X-Real-IP")).thenReturn(IP_TEST);
    }

    @Test
    @DisplayName("Test 1: Visitante primera vez debe retornar estado LIBRE con 3 usos restantes")
    void testVerificarEstado_PrimeraVez_DebeEstarLibre() {
        when(experienciaUsoRepository.findBloqueosActivos(anyString(), anyString(), anyString(), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        when(experienciaUsoRepository.findHistorialVisitante(anyString(), anyString(), anyString()))
                .thenReturn(Collections.emptyList());

        VerificarExpRequest request = VerificarExpRequest.builder()
                .correo(CORREO_TEST)
                .cookieId(COOKIE_TEST)
                .build();

        VerificarExpResponse response = experienciaService.verificarEstado(request, httpRequest);

        assertNotNull(response);
        assertEquals("LIBRE", response.getEstado());
        assertEquals(1, response.getNumeroUsoActual());
        assertEquals(3, response.getUsosRestantes());
        assertTrue(response.getCursosYaVistos().isEmpty());
    }

    @Test
    @DisplayName("Test 2: Visitante dentro de los 7 días de bloqueo debe retornar estado BLOQUEADO con fecha exacta")
    void testVerificarEstado_BloqueoActivo_DebeEstarBloqueado() {
        LocalDateTime expiraBloqueo = LocalDateTime.now().plusDays(5);
        ExperienciaUso usoBloqueado = ExperienciaUso.builder()
                .id(1L)
                .numeroUso(1)
                .correo(CORREO_TEST)
                .ip(IP_TEST)
                .cookieId(COOKIE_TEST)
                .cursosVistos(List.of(10L, 20L))
                .fechaUso(LocalDateTime.now().minusDays(2))
                .expiraEn(expiraBloqueo)
                .build();

        when(experienciaUsoRepository.findBloqueosActivos(anyString(), anyString(), anyString(), any(LocalDateTime.class)))
                .thenReturn(List.of(usoBloqueado));
        when(experienciaUsoRepository.countUsosVisitante(anyString(), anyString(), anyString()))
                .thenReturn(1L);
        when(experienciaUsoRepository.findHistorialVisitante(anyString(), anyString(), anyString()))
                .thenReturn(List.of(usoBloqueado));

        VerificarExpRequest request = VerificarExpRequest.builder()
                .correo(CORREO_TEST)
                .cookieId(COOKIE_TEST)
                .build();

        VerificarExpResponse response = experienciaService.verificarEstado(request, httpRequest);

        assertNotNull(response);
        assertEquals("BLOQUEADO", response.getEstado());
        assertEquals(expiraBloqueo, response.getExpiraEn());
        assertEquals(1, response.getNumeroUsoActual());
        assertEquals(2, response.getUsosRestantes());
        assertEquals(List.of(10L, 20L), response.getCursosYaVistos());
    }

    @Test
    @DisplayName("Test 3: Visitante con 3 usos previos completados debe retornar estado AGOTADO")
    void testVerificarEstado_TresUsosCompletados_DebeEstarAgotado() {
        ExperienciaUso uso1 = ExperienciaUso.builder().numeroUso(1).cursosVistos(List.of(1L, 2L)).build();
        ExperienciaUso uso2 = ExperienciaUso.builder().numeroUso(2).cursosVistos(List.of(3L, 4L)).build();
        ExperienciaUso uso3 = ExperienciaUso.builder().numeroUso(3).cursosVistos(List.of(5L, 6L)).build();

        when(experienciaUsoRepository.findBloqueosActivos(anyString(), anyString(), anyString(), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        when(experienciaUsoRepository.findHistorialVisitante(anyString(), anyString(), anyString()))
                .thenReturn(List.of(uso1, uso2, uso3));

        VerificarExpRequest request = VerificarExpRequest.builder()
                .correo(CORREO_TEST)
                .cookieId(COOKIE_TEST)
                .build();

        VerificarExpResponse response = experienciaService.verificarEstado(request, httpRequest);

        assertNotNull(response);
        assertEquals("AGOTADO", response.getEstado());
        assertEquals(0, response.getUsosRestantes());
        assertEquals(6, response.getCursosYaVistos().size());
    }

    @Test
    @DisplayName("Test 4: Iniciar experiencia con curso ya explorado debe lanzar BadRequestException")
    void testIniciarExperiencia_CursoYaVisto_DebeLanzarBadRequest() {
        ExperienciaUso usoAnterior = ExperienciaUso.builder()
                .numeroUso(1)
                .cursosVistos(List.of(100L, 200L))
                .expiraEn(LocalDateTime.now().minusDays(1)) // Bloqueo ya vencido
                .build();

        when(experienciaUsoRepository.findBloqueosActivos(anyString(), anyString(), anyString(), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        when(experienciaUsoRepository.findHistorialVisitante(anyString(), anyString(), anyString()))
                .thenReturn(List.of(usoAnterior));

        IniciarExpRequest request = IniciarExpRequest.builder()
                .correo(CORREO_TEST)
                .cookieId(COOKIE_TEST)
                .cursosElegidos(List.of(100L, 300L)) // 100 ya fue visto
                .build();

        assertThrows(BadRequestException.class, () -> experienciaService.iniciarExperiencia(request, httpRequest));
    }

    @Test
    @DisplayName("Test 5: Iniciar experiencia con cantidad de cursos diferente a 2 debe lanzar BadRequestException")
    void testIniciarExperiencia_CursosIncorrectos_DebeLanzarBadRequest() {
        IniciarExpRequest request1 = IniciarExpRequest.builder()
                .correo(CORREO_TEST)
                .cursosElegidos(List.of(100L))
                .build();

        assertThrows(BadRequestException.class, () -> experienciaService.iniciarExperiencia(request1, httpRequest));

        IniciarExpRequest requestDuplicado = IniciarExpRequest.builder()
                .correo(CORREO_TEST)
                .cursosElegidos(List.of(100L, 100L))
                .build();

        assertThrows(BadRequestException.class, () -> experienciaService.iniciarExperiencia(requestDuplicado, httpRequest));
    }

    @Test
    @DisplayName("Test 6: Iniciar experiencia válida registra en BD y devuelve token de 15 minutos")
    void testIniciarExperiencia_FlujoExitoso() {
        when(experienciaUsoRepository.findBloqueosActivos(anyString(), anyString(), anyString(), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        when(experienciaUsoRepository.findHistorialVisitante(anyString(), anyString(), anyString()))
                .thenReturn(Collections.emptyList());

        Curso curso1 = Curso.builder().id(10L).nombre("Curso Acupuntura").estado(true).build();
        Curso curso2 = Curso.builder().id(20L).nombre("Curso Fitoterapia").estado(true).build();

        when(cursoRepository.findById(10L)).thenReturn(Optional.of(curso1));
        when(cursoRepository.findById(20L)).thenReturn(Optional.of(curso2));

        Modulo modulo1 = Modulo.builder().id(1L).nombre("Modulo 1").orden(1).build();
        when(moduloRepository.findByCursoIdOrderByOrdenAsc(anyLong())).thenReturn(List.of(modulo1));

        Video video1 = Video.builder().id(1L).titulo("Clase 1").youtubeUrl("https://youtu.be/test").orden(1).build();
        when(videoRepository.findByModuloIdOrderByOrdenAsc(anyLong())).thenReturn(List.of(video1));

        Material mat1 = Material.builder().id(1L).nombre("Guia.pdf").tipoArchivo("application/pdf").build();
        when(materialRepository.findByModuloId(anyLong())).thenReturn(List.of(mat1));

        IniciarExpRequest request = IniciarExpRequest.builder()
                .correo(CORREO_TEST)
                .cookieId(COOKIE_TEST)
                .cursosElegidos(List.of(10L, 20L))
                .build();

        IniciarExpResponse response = experienciaService.iniciarExperiencia(request, httpRequest);

        assertNotNull(response);
        assertNotNull(response.getSessionToken());
        assertEquals(900, response.getDuracionSegundos());
        assertEquals(1, response.getNumeroUso());
        assertEquals(2, response.getCursos().size());

        // Verificar que el material tenga bloqueo activo por defecto
        MaterialExpDto materialResponse = response.getCursos().get(0).getModulos().get(0).getMateriales().get(0);
        assertTrue(materialResponse.getBloqueado());

        // Verificar persistencia en base de datos
        verify(experienciaUsoRepository, times(1)).save(any(ExperienciaUso.class));

        // Test 7: Validar sesión recién creada
        ValidarSesionResponse vSesion = experienciaService.validarSesion(
                ValidarSesionRequest.builder().sessionToken(response.getSessionToken()).build()
        );
        assertTrue(vSesion.getValida());
        assertTrue(vSesion.getSegundosRestantes() > 0);
    }

    @Test
    @DisplayName("Test 8: Extracción de IP considerando cabeceras de proxy y Nginx")
    void testExtraerIp_Headers() {
        HttpServletRequest reqNginx = mock(HttpServletRequest.class);
        when(reqNginx.getHeader("X-Real-IP")).thenReturn("200.48.10.5");
        assertEquals("200.48.10.5", experienciaService.extraerIp(reqNginx));

        HttpServletRequest reqProxy = mock(HttpServletRequest.class);
        when(reqProxy.getHeader("X-Real-IP")).thenReturn(null);
        when(reqProxy.getHeader("X-Forwarded-For")).thenReturn("181.65.20.1, 10.0.0.1");
        assertEquals("181.65.20.1", experienciaService.extraerIp(reqProxy));
    }
}
