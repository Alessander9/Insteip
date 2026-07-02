package com.insteip.backend.repository;

import com.insteip.backend.entity.AvanceCurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AvanceCursoRepository extends JpaRepository<AvanceCurso, Long> {

    java.util.Optional<AvanceCurso> findByUsuarioIdAndCursoId(Long usuarioId, Long cursoId);
    java.util.List<AvanceCurso> findByUsuarioId(Long usuarioId);
}
