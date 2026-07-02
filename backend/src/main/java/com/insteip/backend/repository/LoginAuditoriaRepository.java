package com.insteip.backend.repository;

import com.insteip.backend.entity.LoginAuditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LoginAuditoriaRepository extends JpaRepository<LoginAuditoria, Long> {
    List<LoginAuditoria> findAllByOrderByFechaDesc();
    List<LoginAuditoria> findByUsuarioIdOrderByFechaDesc(Long usuarioId);
}
