package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.diaacupuntura.ActualizarVideoTallerRequest;
import com.insteip.backend.domain.dto.diaacupuntura.MatriculaLoteEventoRequest;
import com.insteip.backend.domain.dto.diaacupuntura.MatriculaResultadoResponse;
import com.insteip.backend.domain.dto.diaacupuntura.ResumenInscritosEventoResponse;
import com.insteip.backend.domain.dto.diaacupuntura.TallerEventoResponse;

import java.util.List;

public interface DiaAcupunturaService {
    List<TallerEventoResponse> listarTalleres(String correoAutenticado);
    List<ResumenInscritosEventoResponse> obtenerResumenInscritos();
    List<MatriculaResultadoResponse> matricularLote(List<MatriculaLoteEventoRequest> solicitudes);
    MatriculaResultadoResponse matricularIndividual(MatriculaLoteEventoRequest request);
    void guardarVideoTaller(Long cursoId, Long videoId, ActualizarVideoTallerRequest request);
    void eliminarVideoTaller(Long cursoId, Long videoId);
}
