package com.insteip.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insteip.backend.domain.dto.experiencia.*;
import com.insteip.backend.infrastructure.security.JwtAuthenticationFilter;
import com.insteip.backend.infrastructure.security.SecurityConfig;
import com.insteip.backend.service.interfaces.ExperienciaService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = ExperienciaController.class, excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
                SecurityConfig.class,
                JwtAuthenticationFilter.class
        })
})
@AutoConfigureMockMvc(addFilters = false)
class ExperienciaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ExperienciaService experienciaService;

    @Test
    @DisplayName("Endpoint POST /api/experiencias/verificar - Retorna 200 y estado")
    void testVerificar_DebeRetornar200() throws Exception {
        VerificarExpRequest request = VerificarExpRequest.builder()
                .correo("alumno.test@example.com")
                .cookieId("uuid-1234")
                .build();

        VerificarExpResponse response = VerificarExpResponse.builder()
                .estado("LIBRE")
                .numeroUsoActual(1)
                .usosRestantes(3)
                .cursosYaVistos(List.of())
                .mensaje("Bienvenido")
                .build();

        when(experienciaService.verificarEstado(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/experiencias/verificar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("LIBRE"))
                .andExpect(jsonPath("$.numeroUsoActual").value(1))
                .andExpect(jsonPath("$.usosRestantes").value(3));
    }

    @Test
    @DisplayName("Endpoint GET /api/experiencias/cursos - Retorna lista de cursos")
    void testListarCursos_DebeRetornar200() throws Exception {
        CursoExpDto curso = CursoExpDto.builder()
                .id(1L)
                .nombre("Acupuntura Básica")
                .yaVisto(false)
                .build();

        when(experienciaService.listarCursosParaExperiencia(any(), any(), any()))
                .thenReturn(List.of(curso));

        mockMvc.perform(get("/api/experiencias/cursos")
                        .param("correo", "test@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].nombre").value("Acupuntura Básica"))
                .andExpect(jsonPath("$[0].yaVisto").value(false));
    }

    @Test
    @DisplayName("Endpoint POST /api/experiencias/iniciar - Retorna sesión y cursos")
    void testIniciar_DebeRetornar200() throws Exception {
        IniciarExpRequest request = IniciarExpRequest.builder()
                .correo("test@example.com")
                .cookieId("cookie-1")
                .cursosElegidos(List.of(1L, 2L))
                .build();

        IniciarExpResponse response = IniciarExpResponse.builder()
                .sessionToken("token-session-15min")
                .inicioSesion(LocalDateTime.now())
                .expiraSesion(LocalDateTime.now().plusMinutes(15))
                .duracionSegundos(900)
                .numeroUso(1)
                .cursos(List.of())
                .build();

        when(experienciaService.iniciarExperiencia(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/experiencias/iniciar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionToken").value("token-session-15min"))
                .andExpect(jsonPath("$.duracionSegundos").value(900))
                .andExpect(jsonPath("$.numeroUso").value(1));
    }

    @Test
    @DisplayName("Endpoint POST /api/experiencias/validar-sesion - Retorna validez de sesión")
    void testValidarSesion_DebeRetornar200() throws Exception {
        ValidarSesionRequest request = ValidarSesionRequest.builder()
                .sessionToken("token-test")
                .build();

        ValidarSesionResponse response = ValidarSesionResponse.builder()
                .valida(true)
                .segundosRestantes(850L)
                .build();

        when(experienciaService.validarSesion(any())).thenReturn(response);

        mockMvc.perform(post("/api/experiencias/validar-sesion")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valida").value(true))
                .andExpect(jsonPath("$.segundosRestantes").value(850));
    }
}
