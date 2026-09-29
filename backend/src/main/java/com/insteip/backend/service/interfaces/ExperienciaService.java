package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.experiencia.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface ExperienciaService {

    VerificarExpResponse verificarEstado(VerificarExpRequest request, HttpServletRequest httpRequest);

    List<CursoExpDto> listarCursosParaExperiencia(String correo, String cookieId, HttpServletRequest httpRequest);

    IniciarExpResponse iniciarExperiencia(IniciarExpRequest request, HttpServletRequest httpRequest);

    ValidarSesionResponse validarSesion(ValidarSesionRequest request);

    String extraerIp(HttpServletRequest request);
}
