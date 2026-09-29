package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.ExperienciaUso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ExperienciaUsoRepository extends JpaRepository<ExperienciaUso, Long> {

    @Query("""
        SELECT e FROM ExperienciaUso e
        WHERE (:correo IS NOT NULL AND LOWER(e.correo) = LOWER(:correo))
           OR (:ip IS NOT NULL AND e.ip = :ip)
           OR (:cookieId IS NOT NULL AND e.cookieId = :cookieId)
        ORDER BY e.fechaUso DESC
    """)
    List<ExperienciaUso> findHistorialVisitante(
        @Param("correo") String correo,
        @Param("ip") String ip,
        @Param("cookieId") String cookieId
    );

    @Query("""
        SELECT e FROM ExperienciaUso e
        WHERE ((:correo IS NOT NULL AND LOWER(e.correo) = LOWER(:correo))
           OR (:ip IS NOT NULL AND e.ip = :ip)
           OR (:cookieId IS NOT NULL AND e.cookieId = :cookieId))
          AND e.expiraEn > :ahora
        ORDER BY e.expiraEn DESC
    """)
    List<ExperienciaUso> findBloqueosActivos(
        @Param("correo") String correo,
        @Param("ip") String ip,
        @Param("cookieId") String cookieId,
        @Param("ahora") LocalDateTime ahora
    );

    @Query("""
        SELECT COUNT(e) FROM ExperienciaUso e
        WHERE (:correo IS NOT NULL AND LOWER(e.correo) = LOWER(:correo))
           OR (:ip IS NOT NULL AND e.ip = :ip)
           OR (:cookieId IS NOT NULL AND e.cookieId = :cookieId)
    """)
    long countUsosVisitante(
        @Param("correo") String correo,
        @Param("ip") String ip,
        @Param("cookieId") String cookieId
    );
}
