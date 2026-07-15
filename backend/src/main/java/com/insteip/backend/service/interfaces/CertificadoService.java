package com.insteip.backend.service.interfaces;

import com.insteip.backend.entity.Certificado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CertificadoService {
    Certificado generarCertificado(Long usuarioId, Long cursoId);
    Certificado obtenerCertificado(Long id);
    Certificado validarCertificado(String codigo);
    Page<com.insteip.backend.dto.CertificadoResponseDTO> listarCertificados(Pageable pageable, String search);
}
