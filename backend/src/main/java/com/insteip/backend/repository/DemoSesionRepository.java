package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.DemoSesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DemoSesionRepository extends JpaRepository<DemoSesion, Long> {
    long countByCuentaDemoAndExpiraAfter(String cuentaDemo, LocalDateTime now);
    List<DemoSesion> findByExpiraAfter(LocalDateTime now);
}
