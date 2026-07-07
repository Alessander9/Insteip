package com.insteip.backend.repository;

import com.insteip.backend.entity.LoginAuditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LoginAuditoriaRepository extends JpaRepository<LoginAuditoria, Long> {
    List<LoginAuditoria> findAllByOrderByFechaDesc();
    List<LoginAuditoria> findByUsuarioIdOrderByFechaDesc(Long usuarioId);
}
