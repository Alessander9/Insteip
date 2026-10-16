package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.diaacupuntura.*;

import java.util.List;

public interface DiaAcupunturaService {
    List<TallerEventoResponse> listarTalleres(String correoAutenticado);
    List<ResumenInscritosEventoResponse> obtenerResumenInscritos();
    List<MatriculaResultadoResponse> matricularLote(List<MatriculaLoteEventoRequest> solicitudes);
    MatriculaResultadoResponse matricularIndividual(MatriculaLoteEventoRequest request);
    void guardarVideoTaller(Long cursoId, Long videoId, ActualizarVideoTallerRequest request);
    void eliminarVideoTaller(Long cursoId, Long videoId);
    default VideoGeneralEventoDto obtenerVideoGeneral() {
        return obtenerVideoGeneral(null);
    }
    VideoGeneralEventoDto obtenerVideoGeneral(String correoAutenticado);
    void guardarVideoGeneral(ActualizarVideoGeneralRequest request);
}
