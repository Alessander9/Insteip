package com.insteip.backend.repository;

import com.insteip.backend.entity.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {
    java.util.Optional<Rol> findByNombre(String nombre);
}
