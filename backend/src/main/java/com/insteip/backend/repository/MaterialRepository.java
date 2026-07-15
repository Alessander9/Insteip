package com.insteip.backend.repository;

import com.insteip.backend.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    java.util.List<Material> findByModuloId(Long moduloId);

    Page<Material> findByModuloId(Long moduloId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT m FROM Material m WHERE m.modulo.id = :moduloId AND " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(m.nombre) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(m.tipoArchivo) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Material> searchByModuloId(@org.springframework.data.repository.query.Param("moduloId") Long moduloId,
                                    @org.springframework.data.repository.query.Param("search") String search,
                                    Pageable pageable);
}
