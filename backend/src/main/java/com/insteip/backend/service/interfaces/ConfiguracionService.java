package com.insteip.backend.service.interfaces;

import com.insteip.backend.dto.ConfiguracionRequest;
import com.insteip.backend.dto.ConfiguracionResponse;

public interface ConfiguracionService {
    ConfiguracionResponse obtenerConfiguracion();
    ConfiguracionResponse actualizarConfiguracion(ConfiguracionRequest request);
}
