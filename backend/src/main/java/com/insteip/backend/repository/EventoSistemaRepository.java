package com.insteip.backend.repository;

import com.insteip.backend.entity.EventoSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventoSistemaRepository extends JpaRepository<EventoSistema, Long> {
    List<EventoSistema> findAllByOrderByFechaDesc();
    List<EventoSistema> findByUsuarioIdOrderByFechaDesc(Long usuarioId);
}
