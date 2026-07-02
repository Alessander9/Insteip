package com.insteip.backend.repository;

import com.insteip.backend.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {

    java.util.List<Curso> findByEstadoTrue();

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Curso c WHERE " +
            "(LOWER(c.nombre) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.descripcion) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<Curso> findPagedAndSearched(
            @org.springframework.data.repository.query.Param("search") String search,
            org.springframework.data.domain.Pageable pageable);
}
