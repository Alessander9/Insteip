package com.insteip.backend.service.interfaces;

import com.insteip.backend.dto.AvanceProgressRequest;
import com.insteip.backend.dto.AvanceProgressResponse;

public interface AvanceService {
    AvanceProgressResponse guardarProgreso(Long usuarioId, AvanceProgressRequest request);
    AvanceProgressResponse obtenerProgreso(Long usuarioId, Long videoId);
}
