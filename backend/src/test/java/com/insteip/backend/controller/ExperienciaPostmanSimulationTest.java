package com.insteip.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insteip.backend.domain.dto.experiencia.*;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.impl.ExperienciaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class ExperienciaPostmanSimulationTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

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

    @InjectMocks
    private ExperienciaServiceImpl experienciaService;

    @BeforeEach
    void setUp() {
        ExperienciaController controller = new ExperienciaController(experienciaService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    private void printPostmanLog(String pruebaNombre, String method, String endpoint, Object requestBody, MvcResult result) throws Exception {
        System.out.println("\n================================================================================");
        System.out.println("📬 POSTMAN TEST: " + pruebaNombre);
        System.out.println("--------------------------------------------------------------------------------");
        System.out.println("👉 HTTP Request: " + method + " " + endpoint);
        System.out.println("👉 Request Headers: Content-Type: application/json, X-Real-IP: 190.237.100.50");
        if (requestBody != null) {
            System.out.println("👉 Request Body:\n" + objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(requestBody));
        }
        System.out.println("--------------------------------------------------------------------------------");
        System.out.println("👈 HTTP Response Status: " + result.getResponse().getStatus());
        System.out.println("👈 Response Body:\n" + result.getResponse().getContentAsString());
        System.out.println("================================================================================\n");
    }

    @Test
    @DisplayName("1. Prueba Postman: primera vez (LIBRE)")
    void test1_Postman_PrimeraVez_Libre() throws Exception {
        when(experienciaUsoRepository.findBloqueosActivos(anyString(), anyString(), anyString(), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        when(experienciaUsoRepository.findHistorialVisitante(anyString(), anyString(), anyString()))
                .thenReturn(Collections.emptyList());

        VerificarExpRequest request = VerificarExpRequest.builder()
                .correo("nuevo.visitante@insteip.com")
                .cookieId("cookie-uuid-nuevo-001")
                .build();

        MvcResult result = mockMvc.perform(post("/api/experiencias/verificar")
                        .header("X-Real-IP", "190.237.100.50")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("LIBRE"))
                .andExpect(jsonPath("$.numeroUsoActual").value(1))
                .andExpect(jsonPath("$.usosRestantes").value(3))
                .andReturn();

        printPostmanLog("1. Primera Vez (LIBRE)", "POST", "/api/experiencias/verificar", request, result);
    }

    @Test
    @DisplayName("2. Prueba Postman: mismo correo en bloqueo activo (BLOQUEADO)")
    void test2_Postman_MismoCorreo_Bloqueado() throws Exception {
        LocalDateTime bloqueoFin = LocalDateTime.now().plusDays(6);
        ExperienciaUso usoActivo = ExperienciaUso.builder()
                .id(1L)
                .numeroUso(1)
                .correo("visitante.bloqueado@insteip.com")
                .ip("190.237.100.50")
                .cookieId("cookie-uuid-001")
                .cursosVistos(List.of(10L, 20L))
                .fechaUso(LocalDateTime.now().minusDays(1))
                .expiraEn(bloqueoFin)
                .build();

        when(experienciaUsoRepository.findBloqueosActivos(anyString(), anyString(), anyString(), any(LocalDateTime.class)))
                .thenReturn(List.of(usoActivo));
        when(experienciaUsoRepository.countUsosVisitante(anyString(), anyString(), anyString()))
                .thenReturn(1L);
        when(experienciaUsoRepository.findHistorialVisitante(anyString(), anyString(), anyString()))
                .thenReturn(List.of(usoActivo));

        VerificarExpRequest request = VerificarExpRequest.builder()
                .correo("visitante.bloqueado@insteip.com")
                .cookieId("cookie-uuid-001")
                .build();

        MvcResult result = mockMvc.perform(post("/api/experiencias/verificar")
                        .header("X-Real-IP", "190.237.100.50")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("BLOQUEADO"))
                .andExpect(jsonPath("$.numeroUsoActual").value(1))
                .andExpect(jsonPath("$.usosRestantes").value(2))
                .andReturn();

        printPostmanLog("2. Mismo correo en bloqueo activo (BLOQUEADO)", "POST", "/api/experiencias/verificar", request, result);
    }

    @Test
    @DisplayName("3. Prueba Postman: cookie diferente pero mismo correo (BLOQUEADO)")
    void test3_Postman_CookieDiferente_MismoCorreo_Bloqueado() throws Exception {
        LocalDateTime bloqueoFin = LocalDateTime.now().plusDays(5);
        ExperienciaUso usoPrevio = ExperienciaUso.builder()
                .id(2L)
                .numeroUso(1)
                .correo("usuario.mismocorreo@insteip.com")
                .ip("181.65.10.20")
                .cookieId("cookie-navegador-original")
                .cursosVistos(List.of(5L, 6L))
                .fechaUso(LocalDateTime.now().minusDays(2))
                .expiraEn(bloqueoFin)
                .build();

        when(experienciaUsoRepository.findBloqueosActivos(eq("usuario.mismocorreo@insteip.com"), anyString(), eq("cookie-navegador-nuevo-incognito"), any(LocalDateTime.class)))
                .thenReturn(List.of(usoPrevio));
        when(experienciaUsoRepository.countUsosVisitante(anyString(), anyString(), anyString()))
                .thenReturn(1L);
        when(experienciaUsoRepository.findHistorialVisitante(anyString(), anyString(), anyString()))
                .thenReturn(List.of(usoPrevio));

        VerificarExpRequest request = VerificarExpRequest.builder()
                .correo("usuario.mismocorreo@insteip.com")
                .cookieId("cookie-navegador-nuevo-incognito") // Simula modo incógnito / otro browser
                .build();

        MvcResult result = mockMvc.perform(post("/api/experiencias/verificar")
                        .header("X-Real-IP", "200.48.50.60")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("BLOQUEADO"))
                .andReturn();

        printPostmanLog("3. Cookie diferente pero mismo correo (BLOQUEADO)", "POST", "/api/experiencias/verificar", request, result);
    }

    @Test
    @DisplayName("4. Prueba Postman: 3 usos completados (AGOTADO)")
    void test4_Postman_TresUsos_Agotado() throws Exception {
        ExperienciaUso u1 = ExperienciaUso.builder().numeroUso(1).cursosVistos(List.of(1L, 2L)).expiraEn(LocalDateTime.now().minusDays(20)).build();
        ExperienciaUso u2 = ExperienciaUso.builder().numeroUso(2).cursosVistos(List.of(3L, 4L)).expiraEn(LocalDateTime.now().minusDays(10)).build();
        ExperienciaUso u3 = ExperienciaUso.builder().numeroUso(3).cursosVistos(List.of(5L, 6L)).expiraEn(LocalDateTime.now().minusDays(1)).build();

        when(experienciaUsoRepository.findBloqueosActivos(anyString(), anyString(), anyString(), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        when(experienciaUsoRepository.findHistorialVisitante(anyString(), anyString(), anyString()))
                .thenReturn(List.of(u1, u2, u3));

        VerificarExpRequest request = VerificarExpRequest.builder()
                .correo("alumno.veterano@insteip.com")
                .cookieId("cookie-uuid-veterano")
                .build();

        MvcResult result = mockMvc.perform(post("/api/experiencias/verificar")
                        .header("X-Real-IP", "190.237.100.50")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("AGOTADO"))
                .andExpect(jsonPath("$.usosRestantes").value(0))
                .andExpect(jsonPath("$.numeroUsoActual").value(3))
                .andReturn();

        printPostmanLog("4. Tres usos completados (AGOTADO)", "POST", "/api/experiencias/verificar", request, result);
    }

    @Test
    @DisplayName("5. Prueba Postman: curso ya visto enviado como nuevo (rechaza con 400)")
    void test5_Postman_CursoYaVisto_RechazaCon400() throws Exception {
        ExperienciaUso uso1 = ExperienciaUso.builder()
                .numeroUso(1)
                .correo("intento.reeleccion@insteip.com")
                .cursosVistos(List.of(10L, 20L)) // Cursos 10 y 20 ya vistos
                .expiraEn(LocalDateTime.now().minusDays(1)) // Bloqueo ya pasó
                .build();

        when(experienciaUsoRepository.findBloqueosActivos(anyString(), anyString(), anyString(), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        when(experienciaUsoRepository.findHistorialVisitante(anyString(), anyString(), anyString()))
                .thenReturn(List.of(uso1));

        // Intenta elegir el curso 10 (ya visto) y el 30 (nuevo)
        IniciarExpRequest request = IniciarExpRequest.builder()
                .correo("intento.reeleccion@insteip.com")
                .cookieId("cookie-1")
                .cursosElegidos(List.of(10L, 30L))
                .build();

        MvcResult result = mockMvc.perform(post("/api/experiencias/iniciar")
                        .header("X-Real-IP", "190.237.100.50")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andReturn();

        printPostmanLog("5. Curso ya visto enviado como nuevo (Rechaza con 400)", "POST", "/api/experiencias/iniciar", request, result);
    }
}
