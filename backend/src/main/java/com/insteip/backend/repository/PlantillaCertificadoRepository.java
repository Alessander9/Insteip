package com.insteip.backend.repository;

import com.insteip.backend.entity.PlantillaCertificado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlantillaCertificadoRepository extends JpaRepository<PlantillaCertificado, Long> {
}
