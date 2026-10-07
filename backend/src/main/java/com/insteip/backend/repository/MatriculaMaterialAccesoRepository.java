package com.insteip.backend.repository;

import com.insteip.backend.domain.entity.MatriculaMaterialAcceso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatriculaMaterialAccesoRepository extends JpaRepository<MatriculaMaterialAcceso, Long> {

    List<MatriculaMaterialAcceso> findByMatriculaId(Long matriculaId);

    Optional<MatriculaMaterialAcceso> findByMatriculaIdAndMaterialId(Long matriculaId, Long materialId);

    boolean existsByMatriculaId(Long matriculaId);

    boolean existsByMatriculaIdAndMaterialIdAndHabilitadoTrue(Long matriculaId, Long materialId);

    void deleteByMatriculaId(Long matriculaId);
}
