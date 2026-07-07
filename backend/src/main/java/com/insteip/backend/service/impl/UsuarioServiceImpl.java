package com.insteip.backend.service.impl;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.dto.UsuarioRequestDTO;
import com.insteip.backend.dto.UsuarioResponseDTO;
import com.insteip.backend.entity.Usuario;
import com.insteip.backend.entity.Rol;
import com.insteip.backend.entity.NivelSuscripcion;
import com.insteip.backend.exception.ResourceNotFoundException;
import com.insteip.backend.exception.BadRequestException;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.repository.RolRepository;
import com.insteip.backend.repository.NivelSuscripcionRepository;
import com.insteip.backend.service.interfaces.UsuarioService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;

    private final RolRepository rolRepository;

    private final NivelSuscripcionRepository suscripcionRepository;

    private final PasswordEncoder passwordEncoder;

    private final com.insteip.backend.service.interfaces.AuditoriaService auditoriaService;

    @Override
    public org.springframework.data.domain.Page<UsuarioResponseDTO> listarAlumnos(org.springframework.data.domain.Pageable pageable, String search) {
        org.springframework.data.domain.Page<Usuario> usuariosPage;
        if (search != null && !search.trim().isEmpty()) {
            usuariosPage = usuarioRepository.findAlumnosPagedAndSearched(search, pageable);
        } else {
            usuariosPage = usuarioRepository.findByRolNombre("ALUMNO", pageable);
        }
        return usuariosPage.map(this::convertToResponseDto);
    }

    @Override
    public UsuarioResponseDTO obtenerAlumno(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alumno no encontrado con id: " + id));
        if (!"ALUMNO".equals(usuario.getRol().getNombre())) {
            throw new BadRequestException("El usuario con id " + id + " no es un Alumno");
        }
        return convertToResponseDto(usuario);
    }

    @Override
    public UsuarioResponseDTO crearAlumno(UsuarioRequestDTO dto) {
        if (usuarioRepository.existsByCorreo(dto.correo())) {
            throw new BadRequestException("El correo ya está registrado");
        }

        Rol rol = rolRepository.findByNombre("ALUMNO")
                .orElseThrow(() -> new ResourceNotFoundException("Rol ALUMNO no encontrado"));
                
        NivelSuscripcion sub = null;
        if (dto.nivelSuscripcionId() != null) {
            sub = suscripcionRepository.findById(dto.nivelSuscripcionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Nivel de suscripción no encontrado"));
        }

        Usuario usuario = Usuario.builder()
                .nombres(dto.nombres())
                .apellidos(dto.apellidos())
                .correo(dto.correo())
                .passwordHash(passwordEncoder.encode(
                        dto.password() != null && !dto.password().isBlank()
                                ? dto.password()
                                : "Alumno123!")) // Contraseña por defecto si no se indica
                .telefono(dto.telefono())
                .rol(rol)
                .nivelSuscripcion(sub)
                .estado(true)
                .build();

        Usuario saved = usuarioRepository.save(usuario);
        auditoriaService.registrarEvento("ALUMNOS", "CREAR", "Creado alumno: " + saved.getNombres() + " " + saved.getApellidos() + " (ID: " + saved.getId() + ")");
        return convertToResponseDto(saved);
    }

    @Override
    public UsuarioResponseDTO editarAlumno(Long id, UsuarioRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));

        if (!"ALUMNO".equals(usuario.getRol().getNombre())) {
            throw new BadRequestException("El usuario con id " + id + " no es un Alumno y no puede ser editado");
        }

        if (!usuario.getCorreo().equalsIgnoreCase(dto.correo()) && usuarioRepository.existsByCorreo(dto.correo())) {
            throw new BadRequestException("El correo ya está registrado por otro usuario");
        }

        usuario.setNombres(dto.nombres());
        usuario.setApellidos(dto.apellidos());
        usuario.setCorreo(dto.correo());
        usuario.setTelefono(dto.telefono());

        if (dto.nivelSuscripcionId() != null) {
            NivelSuscripcion sub = suscripcionRepository.findById(dto.nivelSuscripcionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Nivel de suscripción no encontrado"));
            usuario.setNivelSuscripcion(sub);
        } else {
            usuario.setNivelSuscripcion(null);
        }

        Usuario saved = usuarioRepository.save(usuario);
        auditoriaService.registrarEvento("ALUMNOS", "EDITAR", "Editado alumno: " + saved.getNombres() + " " + saved.getApellidos() + " (ID: " + saved.getId() + ")");
        return convertToResponseDto(saved);
    }

    @Override
    public void cambiarEstado(Long id, Boolean estado) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
        usuario.setEstado(estado);
        Usuario saved = usuarioRepository.save(usuario);
        auditoriaService.registrarEvento("ALUMNOS", estado ? "ACTIVAR" : "DESACTIVAR", 
                (estado ? "Activado" : "Desactivado") + " alumno: " + saved.getNombres() + " " + saved.getApellidos() + " (ID: " + saved.getId() + ")");
    }

    private UsuarioResponseDTO convertToResponseDto(Usuario u) {
        return new UsuarioResponseDTO(
                u.getId(),
                u.getNombres(),
                u.getApellidos(),
                u.getCorreo(),
                u.getTelefono(),
                u.getNivelSuscripcion() != null ? u.getNivelSuscripcion().getNombre() : "NINGUNO",
                u.getEstado()
        );
    }
}
