package com.insteip.backend.repository;

import com.insteip.backend.entity.Modulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModuloRepository extends JpaRepository<Modulo, Long> {

    java.util.List<Modulo> findByCursoIdOrderByOrdenAsc(Long cursoId);
}
