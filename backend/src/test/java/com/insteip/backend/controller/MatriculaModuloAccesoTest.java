package com.insteip.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insteip.backend.domain.dto.matricula.ActualizarAccesosRequestDTO;
import com.insteip.backend.domain.dto.matricula.ModuloAccesoDTO;
import com.insteip.backend.domain.dto.matricula.VideoAccesoDTO;
import com.insteip.backend.infrastructure.security.JwtAuthenticationFilter;
import com.insteip.backend.infrastructure.security.SecurityConfig;
import com.insteip.backend.service.interfaces.MatriculaPdfService;
import com.insteip.backend.service.interfaces.MatriculaService;
import com.insteip.backend.service.interfaces.AuditoriaService;
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
import java.util.Map;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = { MatriculaController.class },
    excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
            SecurityConfig.class,
            JwtAuthenticationFilter.class
        })
    }
)
@AutoConfigureMockMvc(addFilters = false)
class MatriculaModuloAccesoTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private MatriculaService matriculaService;

    @MockitoBean
    private MatriculaPdfService matriculaPdfService;

    @MockitoBean
    private AuditoriaService auditoriaService;

    @Test
    @DisplayName("GET /api/matriculas/{id}/modulos-acceso - Retorna lista de módulos y videos con estado de habilitación")
    void testListarModulosAcceso() throws Exception {
        Long matriculaId = 1L;
        List<VideoAccesoDTO> videosMod1 = List.of(
                new VideoAccesoDTO(201L, "Video 1: Introducción", 1, 300, true, LocalDateTime.now()),
                new VideoAccesoDTO(202L, "Video 2: Conceptos", 2, 450, false, null)
        );
        List<ModuloAccesoDTO> mockList = List.of(
                new ModuloAccesoDTO(101L, "Módulo 1: Fundamentos", 1, true, LocalDateTime.now(), videosMod1),
                new ModuloAccesoDTO(102L, "Módulo 2: Técnicas Avanzadas", 2, false, null, List.of())
        );

        when(matriculaService.listarModulosAcceso(matriculaId)).thenReturn(mockList);

        mockMvc.perform(get("/api/matriculas/{id}/modulos-acceso", matriculaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].moduloId").value(101))
                .andExpect(jsonPath("$[0].nombreModulo").value("Módulo 1: Fundamentos"))
                .andExpect(jsonPath("$[0].habilitado").value(true))
                .andExpect(jsonPath("$[0].videos.length()").value(2))
                .andExpect(jsonPath("$[0].videos[0].videoId").value(201))
                .andExpect(jsonPath("$[0].videos[0].habilitado").value(true))
                .andExpect(jsonPath("$[0].videos[1].videoId").value(202))
                .andExpect(jsonPath("$[0].videos[1].habilitado").value(false))
                .andExpect(jsonPath("$[1].moduloId").value(102))
                .andExpect(jsonPath("$[1].habilitado").value(false));

        verify(matriculaService).listarModulosAcceso(matriculaId);
    }

    @Test
    @DisplayName("GET /api/matriculas/{id}/accesos - Retorna lista completa de accesos (Docente y Admin)")
    void testListarAccesosCompletos() throws Exception {
        Long matriculaId = 1L;
        List<ModuloAccesoDTO> mockList = List.of(
                new ModuloAccesoDTO(101L, "Módulo 1", 1, true, LocalDateTime.now(), List.of(
                        new VideoAccesoDTO(201L, "Video 1", 1, 300, true, LocalDateTime.now())
                ))
        );

        when(matriculaService.listarModulosAcceso(matriculaId)).thenReturn(mockList);

        mockMvc.perform(get("/api/matriculas/{id}/accesos", matriculaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].moduloId").value(101))
                .andExpect(jsonPath("$[0].videos[0].videoId").value(201));

        verify(matriculaService).listarModulosAcceso(matriculaId);
    }

    @Test
    @DisplayName("PATCH /api/matriculas/{id}/modulos/{moduloId}/acceso - Actualiza acceso a módulo vía query param")
    void testActualizarModuloAccesoQueryParam() throws Exception {
        Long matriculaId = 1L;
        Long moduloId = 102L;

        doNothing().when(matriculaService).actualizarModuloAcceso(matriculaId, moduloId, true);

        mockMvc.perform(patch("/api/matriculas/{id}/modulos/{moduloId}/acceso", matriculaId, moduloId)
                        .param("habilitado", "true"))
                .andExpect(status().isNoContent());

        verify(matriculaService).actualizarModuloAcceso(matriculaId, moduloId, true);
    }

    @Test
    @DisplayName("PATCH /api/matriculas/{id}/modulos/{moduloId}/acceso - Actualiza acceso a módulo vía JSON body")
    void testActualizarModuloAccesoJsonBody() throws Exception {
        Long matriculaId = 1L;
        Long moduloId = 102L;

        doNothing().when(matriculaService).actualizarModuloAcceso(matriculaId, moduloId, false);

        mockMvc.perform(patch("/api/matriculas/{id}/modulos/{moduloId}/acceso", matriculaId, moduloId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("habilitado", false))))
                .andExpect(status().isNoContent());

        verify(matriculaService).actualizarModuloAcceso(matriculaId, moduloId, false);
    }

    @Test
    @DisplayName("PUT /api/matriculas/{id}/modulos-acceso - Actualiza módulos masivamente")
    void testActualizarModulosAccesoMasivo() throws Exception {
        Long matriculaId = 1L;
        List<Long> modulosIds = List.of(101L, 102L);

        doNothing().when(matriculaService).actualizarModulosAccesoMasivo(matriculaId, modulosIds);

        mockMvc.perform(put("/api/matriculas/{id}/modulos-acceso", matriculaId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(modulosIds)))
                .andExpect(status().isNoContent());

        verify(matriculaService).actualizarModulosAccesoMasivo(matriculaId, modulosIds);
    }

    @Test
    @DisplayName("PATCH /api/matriculas/{id}/videos/{videoId}/acceso - Actualiza acceso a video vía query param")
    void testActualizarVideoAccesoQueryParam() throws Exception {
        Long matriculaId = 1L;
        Long videoId = 202L;

        doNothing().when(matriculaService).actualizarVideoAcceso(matriculaId, videoId, true);

        mockMvc.perform(patch("/api/matriculas/{id}/videos/{videoId}/acceso", matriculaId, videoId)
                        .param("habilitado", "true"))
                .andExpect(status().isNoContent());

        verify(matriculaService).actualizarVideoAcceso(matriculaId, videoId, true);
    }

    @Test
    @DisplayName("PATCH /api/matriculas/{id}/videos/{videoId}/acceso - Actualiza acceso a video vía JSON body")
    void testActualizarVideoAccesoJsonBody() throws Exception {
        Long matriculaId = 1L;
        Long videoId = 202L;

        doNothing().when(matriculaService).actualizarVideoAcceso(matriculaId, videoId, false);

        mockMvc.perform(patch("/api/matriculas/{id}/videos/{videoId}/acceso", matriculaId, videoId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("habilitado", false))))
                .andExpect(status().isNoContent());

        verify(matriculaService).actualizarVideoAcceso(matriculaId, videoId, false);
    }

    @Test
    @DisplayName("PATCH /api/matriculas/{id}/materiales/{materialId}/acceso - Actualiza acceso a material vía query param")
    void testActualizarMaterialAccesoQueryParam() throws Exception {
        Long matriculaId = 1L;
        Long materialId = 301L;

        doNothing().when(matriculaService).actualizarMaterialAcceso(matriculaId, materialId, true);

        mockMvc.perform(patch("/api/matriculas/{id}/materiales/{materialId}/acceso", matriculaId, materialId)
                        .param("habilitado", "true"))
                .andExpect(status().isNoContent());

        verify(matriculaService).actualizarMaterialAcceso(matriculaId, materialId, true);
    }

    @Test
    @DisplayName("PATCH /api/matriculas/{id}/materiales/{materialId}/acceso - Actualiza acceso a material vía JSON body")
    void testActualizarMaterialAccesoJsonBody() throws Exception {
        Long matriculaId = 1L;
        Long materialId = 301L;

        doNothing().when(matriculaService).actualizarMaterialAcceso(matriculaId, materialId, false);

        mockMvc.perform(patch("/api/matriculas/{id}/materiales/{materialId}/acceso", matriculaId, materialId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("habilitado", false))))
                .andExpect(status().isNoContent());

        verify(matriculaService).actualizarMaterialAcceso(matriculaId, materialId, false);
    }

    @Test
    @DisplayName("PUT /api/matriculas/{id}/accesos - Actualiza accesos granulares de módulos, videos y materiales masivamente")
    void testActualizarAccesosMasivo() throws Exception {
        Long matriculaId = 1L;
        ActualizarAccesosRequestDTO request = new ActualizarAccesosRequestDTO(
                List.of(101L, 102L),
                List.of(201L, 203L),
                List.of(301L, 302L)
        );

        doNothing().when(matriculaService).actualizarAccesosMasivo(eq(matriculaId), any(ActualizarAccesosRequestDTO.class));

        mockMvc.perform(put("/api/matriculas/{id}/accesos", matriculaId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());

        verify(matriculaService).actualizarAccesosMasivo(eq(matriculaId), any(ActualizarAccesosRequestDTO.class));
    }
}
