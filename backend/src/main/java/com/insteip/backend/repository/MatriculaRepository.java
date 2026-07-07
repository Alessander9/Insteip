package com.insteip.backend.repository;

import com.insteip.backend.entity.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

    java.util.Optional<Matricula> findByUsuarioIdAndCursoId(Long usuarioId, Long cursoId);
    java.util.List<Matricula> findByUsuarioId(Long usuarioId);
    java.util.List<Matricula> findByCursoId(Long cursoId);
    boolean existsByUsuarioIdAndCursoId(Long usuarioId, Long cursoId);
    java.util.List<Matricula> findByUsuarioIdAndEstadoTrue(Long usuarioId);
    boolean existsByUsuarioIdAndCursoIdAndEstadoTrue(Long usuarioId, Long cursoId);
}
