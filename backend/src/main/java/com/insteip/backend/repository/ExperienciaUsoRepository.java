package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.ExperienciaUso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ExperienciaUsoRepository extends JpaRepository<ExperienciaUso, Long> {

    @Query(value = """
        SELECT * FROM experiencias_usos e
        WHERE (COALESCE(:correo, '') != '' AND LOWER(e.correo) = LOWER(:correo))
           OR (COALESCE(:ip, '') != '' AND e.ip = :ip)
           OR (COALESCE(:cookieId, '') != '' AND e.cookie_id = :cookieId)
        ORDER BY e.fecha_uso DESC
    """, nativeQuery = true)
    List<ExperienciaUso> findHistorialVisitante(
        @Param("correo") String correo,
        @Param("ip") String ip,
        @Param("cookieId") String cookieId
    );

    @Query(value = """
        SELECT * FROM experiencias_usos e
        WHERE ((COALESCE(:correo, '') != '' AND LOWER(e.correo) = LOWER(:correo))
           OR (COALESCE(:ip, '') != '' AND e.ip = :ip)
           OR (COALESCE(:cookieId, '') != '' AND e.cookie_id = :cookieId))
          AND e.expira_en > :ahora
        ORDER BY e.expira_en DESC
    """, nativeQuery = true)
    List<ExperienciaUso> findBloqueosActivos(
        @Param("correo") String correo,
        @Param("ip") String ip,
        @Param("cookieId") String cookieId,
        @Param("ahora") LocalDateTime ahora
    );

    @Query(value = """
        SELECT COUNT(*) FROM experiencias_usos e
        WHERE (COALESCE(:correo, '') != '' AND LOWER(e.correo) = LOWER(:correo))
           OR (COALESCE(:ip, '') != '' AND e.ip = :ip)
           OR (COALESCE(:cookieId, '') != '' AND e.cookie_id = :cookieId)
    """, nativeQuery = true)
    long countUsosVisitante(
        @Param("correo") String correo,
        @Param("ip") String ip,
        @Param("cookieId") String cookieId
    );
}
