package com.insteip.backend.repository;

import com.insteip.backend.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    java.util.List<Material> findByModuloId(Long moduloId);
}
