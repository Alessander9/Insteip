package com.insteip.backend.service.interfaces;

import com.insteip.backend.domain.dto.certificado.CertificadoResponseDTO;
import com.insteip.backend.domain.dto.certificado.EstadoCertificadoDTO;
import com.insteip.backend.domain.entity.Certificado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface CertificadoService {
    Certificado generarCertificado(Long usuarioId, Long cursoId);
    Certificado obtenerCertificado(Long id);
    Certificado validarCertificado(String codigo);
    Page<CertificadoResponseDTO> listarCertificados(Pageable pageable, String search);
    EstadoCertificadoDTO obtenerEstadoCertificado(Long usuarioId, Long cursoId);
    CertificadoResponseDTO subirCertificadoOficial(Long usuarioId, Long cursoId, MultipartFile archivoPdf);
}
