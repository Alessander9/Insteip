package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.demo.DemoActivarRequest;
import com.insteip.backend.domain.dto.demo.DemoActivarResponse;
import com.insteip.backend.domain.dto.demo.DemoCuentaDisponibleResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface DemoService {
    DemoCuentaDisponibleResponse obtenerCuentaYCursosDisponibles(HttpServletRequest request);
    DemoActivarResponse activarDemo(DemoActivarRequest request, String bearerToken, HttpServletRequest httpRequest);
}
