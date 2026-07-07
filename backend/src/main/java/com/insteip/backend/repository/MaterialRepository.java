package com.insteip.backend.repository;

import com.insteip.backend.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
public interface MaterialRepository extends JpaRepository<Material, Long> {

    java.util.List<Material> findByModuloId(Long moduloId);
}
