package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.MatriculaVideoAcceso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatriculaVideoAccesoRepository extends JpaRepository<MatriculaVideoAcceso, Long> {

    List<MatriculaVideoAcceso> findByMatriculaId(Long matriculaId);

    Optional<MatriculaVideoAcceso> findByMatriculaIdAndVideoId(Long matriculaId, Long videoId);

    boolean existsByMatriculaId(Long matriculaId);

    boolean existsByMatriculaIdAndVideoIdAndHabilitadoTrue(Long matriculaId, Long videoId);

    void deleteByMatriculaId(Long matriculaId);
}
