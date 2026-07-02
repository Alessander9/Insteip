package com.insteip.backend.repository;

import com.insteip.backend.entity.ConfiguracionInstitucion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfiguracionInstitucionRepository extends JpaRepository<ConfiguracionInstitucion, Long> {
}
