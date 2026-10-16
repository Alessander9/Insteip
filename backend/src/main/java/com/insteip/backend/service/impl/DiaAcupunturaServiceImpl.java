package com.insteip.backend.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insteip.backend.domain.dto.diaacupuntura.*;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.DiaAcupunturaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiaAcupunturaServiceImpl implements DiaAcupunturaService {

    public static final List<String> NOMBRES_TALLERES_OFICIALES = List.of(
            "Auriculoterapia en Sistema Nervioso y Control de Peso",
            "Taller de Chi Kung",
            "Reflexología en Sistema Nervioso y Sistema Inmune",
            "La Importancia de la Dietética en Trastornos Metabólicos",
            "El Abordaje del Dolor con Terapia Manual y Acupuntura",
            "Abordaje de Parálisis Facial con Terapia Manual y Acupuntura"
    );

    private final CursoRepository cursoRepository;
    private final ModuloRepository moduloRepository;
    private final VideoRepository videoRepository;
    private final MaterialRepository materialRepository;
    private final UsuarioRepository usuarioRepository;
    private final MatriculaRepository matriculaRepository;
    private final RolRepository rolRepository;
    private final AvanceVideoRepository avanceVideoRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${application.storage.path:storage}")
    private String storagePath;

    @Override
    @Transactional(readOnly = true)
    public List<TallerEventoResponse> listarTalleres(String correoAutenticado) {
        List<Curso> cursosEvento = obtenerCursosEvento();

        Set<Long> cursosMatriculadosIds = new HashSet<>();
        Map<Long, Long> cursoToMatriculaIdMap = new HashMap<>();

        if (correoAutenticado != null && !correoAutenticado.trim().isEmpty()) {
            Optional<Usuario> userOpt = usuarioRepository.findByCorreo(correoAutenticado.trim().toLowerCase());
            if (userOpt.isPresent()) {
                Usuario usuario = userOpt.get();
                List<Matricula> matriculas = matriculaRepository.findByUsuarioIdAndEstadoTrue(usuario.getId());
                for (Matricula m : matriculas) {
                    if (m.getCurso() != null) {
                        cursosMatriculadosIds.add(m.getCurso().getId());
                        cursoToMatriculaIdMap.put(m.getCurso().getId(), m.getId());
                    }
                }
            }
        }

        List<TallerEventoResponse> response = new ArrayList<>();
        int index = 1;
        for (Curso curso : cursosEvento) {
            boolean inscrito = cursosMatriculadosIds.contains(curso.getId());
            String docente = curso.getDocente() != null 
                    ? curso.getDocente().getNombres() + " " + curso.getDocente().getApellidos()
                    : "Docente Especialista INSTEIP";

            List<Modulo> modulos = moduloRepository.findByCursoIdOrderByOrdenAsc(curso.getId());
            Long moduloId = null;
            List<TallerEventoResponse.VideoEventoDto> videosDtos = new ArrayList<>();
            List<TallerEventoResponse.MaterialEventoDto> materialesDtos = new ArrayList<>();

            if (!modulos.isEmpty()) {
                moduloId = modulos.get(0).getId();

                for (Modulo m : modulos) {
                    if (Boolean.FALSE.equals(m.getEstado())) continue;

                    List<Video> videos = videoRepository.findByModuloIdOrderByOrdenAsc(m.getId());
                    for (Video v : videos) {
                        if (Boolean.FALSE.equals(v.getEstado())) continue;
                        videosDtos.add(TallerEventoResponse.VideoEventoDto.builder()
                                .id(v.getId())
                                .titulo(v.getTitulo())
                                .youtubeUrl(v.getYoutubeUrl())
                                .youtubeId(v.getYoutubeId())
                                .duracionMinutos(v.getDuracionSegundos() != null ? v.getDuracionSegundos() / 60 : 90)
                                .orden(v.getOrden())
                                .build());
                    }

                    List<Material> mats = materialRepository.findByModuloId(m.getId());
                    for (Material mat : mats) {
                        if (Boolean.FALSE.equals(mat.getEstado())) continue;
                        materialesDtos.add(TallerEventoResponse.MaterialEventoDto.builder()
                                .id(mat.getId())
                                .nombre(mat.getNombre())
                                .archivoUrl(mat.getArchivoUrl())
                                .tipoArchivo(mat.getTipoArchivo())
                                .build());
                    }
                }
            }

            int duracionTotal = videosDtos.stream()
                    .mapToInt(v -> v.getDuracionMinutos() != null ? v.getDuracionMinutos() : 0)
                    .sum();

            response.add(TallerEventoResponse.builder()
                    .id(curso.getId())
                    .nombre(curso.getNombre())
                    .descripcion(curso.getDescripcion())
                    .imagenPortada(curso.getImagenPortada())
                    .docente(docente)
                    .duracionMinutos(duracionTotal > 0 ? duracionTotal : 90)
                    .inscrito(inscrito)
                    .matriculaId(cursoToMatriculaIdMap.get(curso.getId()))
                    .orden(index++)
                    .moduloId(moduloId)
                    .videos(videosDtos)
                    .materiales(materialesDtos)
                    .build());
        }

        return response;
    }

    @Override
    @Transactional
    public void guardarVideoTaller(Long cursoId, Long videoId, ActualizarVideoTallerRequest request) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Taller no encontrado con id: " + cursoId));

        List<Modulo> modulos = moduloRepository.findByCursoIdOrderByOrdenAsc(curso.getId());
        Modulo modulo;
        if (modulos.isEmpty()) {
            modulo = Modulo.builder()
                    .curso(curso)
                    .nombre("Sesión Principal: " + curso.getNombre())
                    .descripcion("Clase y contenidos del Día de la Acupuntura.")
                    .orden(1)
                    .estado(true)
                    .build();
            modulo = moduloRepository.save(modulo);
        } else {
            modulo = modulos.get(0);
        }

        String url = request.getYoutubeUrl().trim();
        String youtubeId = extraerYoutubeId(url);
        String titulo = request.getTitulo() != null && !request.getTitulo().trim().isEmpty() 
                ? request.getTitulo().trim() 
                : "Clase / Parte del Taller: " + curso.getNombre();

        int duracionSeg = (request.getDuracionMinutos() != null && request.getDuracionMinutos() > 0)
                ? request.getDuracionMinutos() * 60
                : 5400;

        if (videoId != null && videoId > 0) {
            Video v = videoRepository.findById(videoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Video no encontrado con id: " + videoId));
            v.setYoutubeUrl(url);
            v.setYoutubeId(youtubeId);
            v.setTitulo(titulo);
            v.setDuracionSegundos(duracionSeg);
            videoRepository.save(v);
            log.info("Video ID {} actualizado para el taller ID: {}", videoId, cursoId);
        } else {
            List<Video> videosExistentes = videoRepository.findByModuloIdOrderByOrdenAsc(modulo.getId());
            int nextOrden = videosExistentes.size() + 1;

            Video nuevo = Video.builder()
                    .modulo(modulo)
                    .titulo(titulo)
                    .descripcion("Grabación oficial del Día de la Acupuntura.")
                    .youtubeUrl(url)
                    .youtubeId(youtubeId)
                    .duracionSegundos(duracionSeg)
                    .orden(nextOrden)
                    .estado(true)
                    .fechaCreacion(LocalDateTime.now())
                    .build();
            videoRepository.save(nuevo);
            log.info("Nuevo video agregado para el taller ID: {}", cursoId);
        }
    }

    @Override
    @Transactional
    public void eliminarVideoTaller(Long cursoId, Long videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video no encontrado con id: " + videoId));
        // Limpiar avances previos asociados al video para evitar conflicto de clave foránea
        avanceVideoRepository.deleteByVideoId(videoId);
        videoRepository.delete(video);
        log.info("Video ID {} eliminado del taller ID {}", videoId, cursoId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumenInscritosEventoResponse> obtenerResumenInscritos() {
        List<Curso> cursosEvento = obtenerCursosEvento();
        List<ResumenInscritosEventoResponse> resumenList = new ArrayList<>();

        for (Curso curso : cursosEvento) {
            List<Matricula> matriculas = matriculaRepository.findByCursoId(curso.getId());
            List<ResumenInscritosEventoResponse.AlumnoInscritoEventoDto> alumnosDtos = matriculas.stream()
                    .filter(m -> m.getUsuario() != null)
                    .map(m -> {
                        Usuario u = m.getUsuario();
                        return ResumenInscritosEventoResponse.AlumnoInscritoEventoDto.builder()
                                .usuarioId(u.getId())
                                .nombresCompletos(u.getNombres() + " " + u.getApellidos())
                                .correo(u.getCorreo())
                                .telefono(u.getTelefono())
                                .matriculaId(m.getId())
                                .estado(Boolean.TRUE.equals(m.getEstado()))
                                .build();
                    }).collect(Collectors.toList());

            resumenList.add(ResumenInscritosEventoResponse.builder()
                    .cursoId(curso.getId())
                    .cursoNombre(curso.getNombre())
                    .totalInscritos(alumnosDtos.size())
                    .alumnos(alumnosDtos)
                    .build());
        }

        return resumenList;
    }

    @Override
    @Transactional
    public List<MatriculaResultadoResponse> matricularLote(List<MatriculaLoteEventoRequest> solicitudes) {
        if (solicitudes == null || solicitudes.isEmpty()) {
            throw new BadRequestException("La lista de matrículas no puede estar vacía.");
        }
        List<MatriculaResultadoResponse> resultados = new ArrayList<>();
        for (MatriculaLoteEventoRequest req : solicitudes) {
            resultados.add(matricularIndividual(req));
        }
        return resultados;
    }

    @Override
    @Transactional
    public MatriculaResultadoResponse matricularIndividual(MatriculaLoteEventoRequest request) {
        String correo = request.getCorreo().trim().toLowerCase();
        final String passRaw = (request.getPassword() != null && !request.getPassword().trim().isEmpty())
                ? request.getPassword().trim()
                : (request.getTelefono() != null && !request.getTelefono().trim().isEmpty() ? request.getTelefono().trim() : "Insteip2026*");

        boolean esNuevo = false;
        Usuario usuario = usuarioRepository.findByCorreo(correo).orElse(null);

        if (usuario == null) {
            esNuevo = true;
            Rol rolAlumno = rolRepository.findByNombre("ALUMNO")
                    .orElseThrow(() -> new ResourceNotFoundException("Rol ALUMNO no configurado"));

            Usuario nuevo = Usuario.builder()
                    .correo(correo)
                    .nombres(request.getNombres().trim())
                    .apellidos(request.getApellidos().trim())
                    .telefono(request.getTelefono() != null ? request.getTelefono().trim() : null)
                    .passwordHash(passwordEncoder.encode(passRaw))
                    .passwordPlain(passRaw)
                    .rol(rolAlumno)
                    .estado(true)
                    .fechaRegistro(LocalDateTime.now())
                    .build();

            usuario = usuarioRepository.save(nuevo);
        } else {
            // Si el usuario existe pero no tenía teléfono, completarlo si viene en la solicitud
            if ((usuario.getTelefono() == null || usuario.getTelefono().isBlank()) && request.getTelefono() != null && !request.getTelefono().isBlank()) {
                usuario.setTelefono(request.getTelefono().trim());
                usuario = usuarioRepository.save(usuario);
            }
        }

        List<MatriculaResultadoResponse.DetalleMatriculaDto> matriculasDetalles = new ArrayList<>();

        List<Long> cursosIds = request.getCursosIds();
        if (cursosIds == null || cursosIds.isEmpty()) {
            // Si no se especificaron cursos, matricular en todos los 6 talleres oficiales del evento
            cursosIds = obtenerCursosEvento().stream().map(Curso::getId).collect(Collectors.toList());
        }

        for (Long cursoId : cursosIds) {
            if (cursoId == null) continue;
            Curso curso = cursoRepository.findById(cursoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id: " + cursoId));

            Optional<Matricula> existOpt = matriculaRepository.findByUsuarioIdAndCursoId(usuario.getId(), curso.getId());
            Matricula m;
            if (existOpt.isPresent()) {
                m = existOpt.get();
                if (Boolean.FALSE.equals(m.getEstado())) {
                    m.setEstado(true);
                    m = matriculaRepository.save(m);
                }
            } else {
                m = Matricula.builder()
                        .usuario(usuario)
                        .curso(curso)
                        .estado(true)
                        .fechaMatricula(LocalDateTime.now())
                        .build();
                m = matriculaRepository.save(m);
            }

            matriculasDetalles.add(MatriculaResultadoResponse.DetalleMatriculaDto.builder()
                    .matriculaId(m.getId())
                    .cursoId(curso.getId())
                    .cursoNombre(curso.getNombre())
                    .build());
        }

        String passwordRetorno = esNuevo 
                ? passRaw 
                : (usuario.getPasswordPlain() != null && !usuario.getPasswordPlain().isBlank() ? usuario.getPasswordPlain() : "(Cuenta existente - clave previa)");

        return MatriculaResultadoResponse.builder()
                .usuarioId(usuario.getId())
                .correo(usuario.getCorreo())
                .nombresCompletos(usuario.getNombres() + " " + usuario.getApellidos())
                .telefono(usuario.getTelefono())
                .passwordAsignada(passwordRetorno)
                .matriculas(matriculasDetalles)
                .build();
    }

    private List<Curso> obtenerCursosEvento() {
        List<Curso> todosActivos = cursoRepository.findByEstadoTrue();
        List<Curso> filtrados = new ArrayList<>();

        for (String nombreOficial : NOMBRES_TALLERES_OFICIALES) {
            todosActivos.stream()
                    .filter(c -> c.getNombre() != null && (c.getNombre().trim().equalsIgnoreCase(nombreOficial.trim()) || c.getNombre().toLowerCase().contains(nombreOficial.toLowerCase())))
                    .findFirst()
                    .ifPresent(filtrados::add);
        }

        return filtrados;
    }

    private String extraerYoutubeId(String url) {
        if (url == null || url.isBlank()) return null;
        String clean = url.trim();
        if (clean.matches("^[\\w-]{11}$")) {
            return clean;
        }
        Pattern pattern = Pattern.compile("(?:youtu\\.be/|youtube\\.com/(?:embed/|v/|live/|shorts/|watch\\?v=|watch\\?.+&v=))([\\w-]{11})");
        Matcher matcher = pattern.matcher(clean);
        return matcher.find() ? matcher.group(1) : null;
    }

    private Path getVideoGeneralFilePath() {
        String base = (storagePath != null && !storagePath.isBlank()) ? storagePath : "storage";
        return Paths.get(base, "dia-acupuntura-video-general.json");
    }

    @Override
    public VideoGeneralEventoDto obtenerVideoGeneral(String correoAutenticado) {
        VideoGeneralEventoDto dto = null;
        try {
            Path path = getVideoGeneralFilePath();
            if (Files.exists(path)) {
                dto = objectMapper.readValue(path.toFile(), VideoGeneralEventoDto.class);
            }
        } catch (Exception e) {
            log.error("Error al leer archivo de video general del evento: {}", e.getMessage());
        }

        if (dto == null) {
            // Configuración por defecto si aún no ha sido configurado por el administrador
            dto = VideoGeneralEventoDto.builder()
                    .titulo("Sesión Inaugural: Día de la Acupuntura")
                    .descripcion("Transmisión magistral y apertura oficial de la Jornada Internacional de Acupuntura. Acceso exclusivo para participantes.")
                    .youtubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                    .youtubeId("dQw4w9WgXcQ")
                    .duracionMinutos(90)
                    .activo(true)
                    .build();
        }

        boolean tieneAcceso = false;
        if (correoAutenticado != null && !correoAutenticado.trim().isEmpty()) {
            Optional<Usuario> userOpt = usuarioRepository.findByCorreo(correoAutenticado.trim().toLowerCase());
            if (userOpt.isPresent()) {
                Usuario user = userOpt.get();
                if (user.getRol() != null && "ADMINISTRADOR".equalsIgnoreCase(user.getRol().getNombre())) {
                    tieneAcceso = true;
                } else {
                    List<Curso> cursosEvento = obtenerCursosEvento();
                    Set<Long> idsEvento = cursosEvento.stream().map(Curso::getId).collect(Collectors.toSet());
                    List<Matricula> matriculas = matriculaRepository.findByUsuarioIdAndEstadoTrue(user.getId());
                    tieneAcceso = matriculas.stream()
                            .anyMatch(m -> m.getCurso() != null && idsEvento.contains(m.getCurso().getId()));
                }
            }
        }

        // Si el usuario no tiene acceso, anonimizamos la URL e ID de YouTube protegiendo el streaming
        if (!tieneAcceso) {
            return VideoGeneralEventoDto.builder()
                    .titulo(dto.getTitulo())
                    .descripcion(dto.getDescripcion())
                    .duracionMinutos(dto.getDuracionMinutos())
                    .activo(dto.getActivo())
                    .youtubeUrl(null)
                    .youtubeId(null)
                    .build();
        }

        return dto;
    }

    @Override
    public void guardarVideoGeneral(ActualizarVideoGeneralRequest request) {
        if (request.getYoutubeUrl() == null || request.getYoutubeUrl().trim().isEmpty()) {
            throw new BadRequestException("La URL de YouTube es requerida.");
        }

        String url = request.getYoutubeUrl().trim();
        String youtubeId = extraerYoutubeId(url);
        if (youtubeId == null || youtubeId.isBlank()) {
            throw new BadRequestException("No se pudo extraer un ID válido de YouTube de la URL proporcionada.");
        }

        String titulo = (request.getTitulo() != null && !request.getTitulo().trim().isEmpty())
                ? request.getTitulo().trim()
                : "Sesión Inaugural: Día de la Acupuntura";

        String desc = (request.getDescripcion() != null && !request.getDescripcion().trim().isEmpty())
                ? request.getDescripcion().trim()
                : "Transmisión magistral y apertura oficial de la Jornada Internacional de Acupuntura.";

        int duracionMin = (request.getDuracionMinutos() != null && request.getDuracionMinutos() > 0)
                ? request.getDuracionMinutos()
                : 90;

        boolean activo = request.getActivo() == null || Boolean.TRUE.equals(request.getActivo());

        VideoGeneralEventoDto dto = VideoGeneralEventoDto.builder()
                .youtubeUrl(url)
                .youtubeId(youtubeId)
                .titulo(titulo)
                .descripcion(desc)
                .duracionMinutos(duracionMin)
                .activo(activo)
                .build();

        try {
            Path path = getVideoGeneralFilePath();
            if (path.getParent() != null && !Files.exists(path.getParent())) {
                Files.createDirectories(path.getParent());
            }
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(path.toFile(), dto);
            log.info("Video general del Día de la Acupuntura actualizado exitosamente. YouTube ID: {}", youtubeId);
        } catch (Exception e) {
            log.error("Error al persistir archivo de video general del evento: {}", e.getMessage(), e);
            throw new BadRequestException("No se pudo guardar la configuración del video general: " + e.getMessage());
        }
    }
}
