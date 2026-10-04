package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.DemoIpCurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DemoIpCursoRepository extends JpaRepository<DemoIpCurso, Long> {
    List<DemoIpCurso> findByIpAddress(String ipAddress);
    boolean existsByIpAddressAndCursoId(String ipAddress, Long cursoId);
}
