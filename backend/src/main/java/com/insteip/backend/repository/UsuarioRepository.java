package com.insteip.backend.repository;

import com.insteip.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    java.util.Optional<Usuario> findByCorreo(String correo);
    java.util.List<Usuario> findByRolNombre(String rolNombre);
    boolean existsByCorreo(String correo);
    java.util.Optional<Usuario> findByPasswordResetToken(String passwordResetToken);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM Usuario u WHERE u.rol.nombre = 'ALUMNO' AND " +
            "(LOWER(u.nombres) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.apellidos) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.correo) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<Usuario> findAlumnosPagedAndSearched(
            @org.springframework.data.repository.query.Param("search") String search,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM Usuario u WHERE u.rol.nombre = 'DOCENTE' AND " +
            "(LOWER(u.nombres) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.apellidos) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.correo) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<Usuario> findDocentesPagedAndSearched(
            @org.springframework.data.repository.query.Param("search") String search,
            org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<Usuario> findByRolNombre(String rolNombre, org.springframework.data.domain.Pageable pageable);
}
