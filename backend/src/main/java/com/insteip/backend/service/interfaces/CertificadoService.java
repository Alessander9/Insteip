package com.insteip.backend.service.interfaces;

import com.insteip.backend.entity.Certificado;

public interface CertificadoService {
    Certificado generarCertificado(Long usuarioId, Long cursoId);
    Certificado obtenerCertificado(Long id);
    Certificado validarCertificado(String codigo);
    java.util.List<com.insteip.backend.dto.CertificadoResponseDTO> listarCertificados(String search);
}
