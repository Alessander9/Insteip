package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.experiencia.*;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.domain.exception.ForbiddenException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.ExperienciaService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExperienciaServiceImpl implements ExperienciaService {

    private final ExperienciaUsoRepository experienciaUsoRepository;
    private final CursoRepository cursoRepository;
    private final ModuloRepository moduloRepository;
    private final VideoRepository videoRepository;
    private final MaterialRepository materialRepository;

    // Cache concurrente en memoria para tokens de sesión temporal (15 minutos)
    private static final Map<String, LocalDateTime> activeSessions = new ConcurrentHashMap<>();

    @Override
    @Transactional(readOnly = true)
    public VerificarExpResponse verificarEstado(VerificarExpRequest request, HttpServletRequest httpRequest) {
        String correo = request.getCorreo() != null ? request.getCorreo().trim().toLowerCase() : null;
        String cookieId = request.getCookieId() != null ? request.getCookieId().trim() : null;
        String ip = extraerIp(httpRequest);

        log.info("Verificando estado de Experiencia INSTEIP para correo: {}, IP: {}, Cookie: {}", correo, ip, cookieId);

        LocalDateTime ahora = LocalDateTime.now();

        // 1. Verificar si existe algún bloqueo de 7 días activo
        List<ExperienciaUso> bloqueosActivos = experienciaUsoRepository.findBloqueosActivos(correo, ip, cookieId, ahora);
        if (!bloqueosActivos.isEmpty()) {
            ExperienciaUso bloqueo = bloqueosActivos.get(0);
            return VerificarExpResponse.builder()
                    .estado("BLOQUEADO")
                    .expiraEn(bloqueo.getExpiraEn())
                    .numeroUsoActual(bloqueo.getNumeroUso())
                    .usosRestantes(Math.max(0, 3 - (int) experienciaUsoRepository.countUsosVisitante(correo, ip, cookieId)))
                    .cursosYaVistos(obtenerIdsCursosVistos(correo, ip, cookieId))
                    .mensaje("Tu acceso gratuito está en pausa por 7 días. Estará disponible nuevamente el " + bloqueo.getExpiraEn())
                    .build();
        }

        // 2. Obtener historial completo de usos
        List<ExperienciaUso> historial = experienciaUsoRepository.findHistorialVisitante(correo, ip, cookieId);
        int totalUsos = historial.size();
        List<Long> cursosYaVistos = historial.stream()
                .filter(e -> e.getCursosVistos() != null)
                .flatMap(e -> e.getCursosVistos().stream())
                .distinct()
                .collect(Collectors.toList());

        // 3. Verificar si ya agotó los 3 usos permitidos
        if (totalUsos >= 3) {
            return VerificarExpResponse.builder()
                    .estado("AGOTADO")
                    .numeroUsoActual(3)
                    .usosRestantes(0)
                    .cursosYaVistos(cursosYaVistos)
                    .mensaje("Has completado tus 3 accesos gratuitos a la Experiencia INSTEIP. ¡Inscríbete hoy para acceso ilimitado!")
                    .build();
        }

        // 4. Visitante libre para iniciar su siguiente uso
        int proximoUso = totalUsos + 1;
        int restantes = 3 - totalUsos;

        return VerificarExpResponse.builder()
                .estado("LIBRE")
                .numeroUsoActual(proximoUso)
                .usosRestantes(restantes)
                .cursosYaVistos(cursosYaVistos)
                .mensaje("¡Bienvenido! Selecciona 2 cursos para comenzar tu prueba gratuita de 15 minutos.")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CursoExpDto> listarCursosParaExperiencia(String correo, String cookieId, HttpServletRequest httpRequest) {
        String ip = extraerIp(httpRequest);
        String correoLimpio = correo != null ? correo.trim().toLowerCase() : null;
        String cookieLimpia = cookieId != null ? cookieId.trim() : null;

        Set<Long> vistos = new HashSet<>(obtenerIdsCursosVistos(correoLimpio, ip, cookieLimpia));
        List<Curso> cursosActivos = cursoRepository.findByEstadoTrue();

        return cursosActivos.stream().map(c -> {
            boolean yaVisto = vistos.contains(c.getId());
            return CursoExpDto.builder()
                    .id(c.getId())
                    .nombre(c.getNombre())
                    .descripcion(c.getDescripcion())
                    .imagenPortada(c.getImagenPortada())
                    .yaVisto(yaVisto)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public IniciarExpResponse iniciarExperiencia(IniciarExpRequest request, HttpServletRequest httpRequest) {
        String correo = request.getCorreo().trim().toLowerCase();
        String cookieId = request.getCookieId() != null ? request.getCookieId().trim() : null;
        String ip = extraerIp(httpRequest);
        List<Long> cursosElegidos = request.getCursosElegidos();

        if (cursosElegidos == null || cursosElegidos.size() != 2) {
            throw new BadRequestException("Debes seleccionar exactamente 2 cursos para la experiencia.");
        }

        if (cursosElegidos.get(0).equals(cursosElegidos.get(1))) {
            throw new BadRequestException("Debes seleccionar 2 cursos diferentes.");
        }

        // 1. Validar estado actual del visitante
        VerificarExpRequest vReq = VerificarExpRequest.builder().correo(correo).cookieId(cookieId).build();
        VerificarExpResponse estado = verificarEstado(vReq, httpRequest);

        if (!"LIBRE".equalsIgnoreCase(estado.getEstado())) {
            throw new ForbiddenException("No puedes iniciar la experiencia. Estado actual: " + estado.getEstado() + " - " + estado.getMensaje());
        }

        // 2. Validar que los cursos seleccionados no hayan sido explorados antes
        List<Long> cursosYaVistos = estado.getCursosYaVistos() != null ? estado.getCursosYaVistos() : Collections.emptyList();
        for (Long cursoId : cursosElegidos) {
            if (cursosYaVistos.contains(cursoId)) {
                throw new BadRequestException("El curso con ID " + cursoId + " ya fue explorado en una visita previa y no puede seleccionarse nuevamente.");
            }
        }

        // 3. Obtener y construir la estructura completa de los 2 cursos
        List<CursoExpDto> cursosDetalle = new ArrayList<>();
        for (Long cursoId : cursosElegidos) {
            Curso curso = cursoRepository.findById(cursoId)
                    .filter(Curso::getEstado)
                    .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado o inactivo con ID: " + cursoId));

            List<Modulo> modulos = moduloRepository.findByCursoIdOrderByOrdenAsc(cursoId);
            List<ModuloExpDto> modulosDto = modulos.stream().map(m -> {
                List<Video> videos = videoRepository.findByModuloIdOrderByOrdenAsc(m.getId());
                List<VideoExpDto> videosDto = videos.stream().map(v -> VideoExpDto.builder()
                        .id(v.getId())
                        .titulo(v.getTitulo())
                        .descripcion(v.getDescripcion())
                        .youtubeUrl(v.getYoutubeUrl())
                        .youtubeId(v.getYoutubeId())
                        .duracionSegundos(v.getDuracionSegundos())
                        .orden(v.getOrden())
                        .build()
                ).collect(Collectors.toList());

                List<Material> materiales = materialRepository.findByModuloId(m.getId());
                List<MaterialExpDto> materialesDto = materiales.stream().map((Material mat) -> MaterialExpDto.builder()
                        .id(mat.getId())
                        .nombre(mat.getNombre())
                        .tipo(mat.getTipoArchivo())
                        .bloqueado(true)
                        .mensajeBloqueo("Disponible con tu plan de suscripción")
                        .build()
                ).collect(Collectors.toList());

                return ModuloExpDto.builder()
                        .id(m.getId())
                        .nombre(m.getNombre())
                        .descripcion(m.getDescripcion())
                        .orden(m.getOrden())
                        .videos(videosDto)
                        .materiales(materialesDto)
                        .build();
            }).collect(Collectors.toList());

            cursosDetalle.add(CursoExpDto.builder()
                    .id(curso.getId())
                    .nombre(curso.getNombre())
                    .descripcion(curso.getDescripcion())
                    .imagenPortada(curso.getImagenPortada())
                    .yaVisto(false)
                    .modulos(modulosDto)
                    .build());
        }

        // 4. Registrar el uso en la base de datos con bloqueo de 7 días
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime expiraBloqueo = ahora.plusDays(7);

        ExperienciaUso nuevoUso = ExperienciaUso.builder()
                .numeroUso(estado.getNumeroUsoActual())
                .correo(correo)
                .ip(ip)
                .cookieId(cookieId)
                .cursosVistos(cursosElegidos)
                .fechaUso(ahora)
                .expiraEn(expiraBloqueo)
                .build();

        experienciaUsoRepository.save(nuevoUso);
        log.info("Experiencia INSTEIP uso #{} registrado para {}", nuevoUso.getNumeroUso(), correo);

        // 5. Generar token de sesión en memoria por 15 minutos (900 segundos)
        String sessionToken = UUID.randomUUID().toString();
        LocalDateTime expiraSesion = ahora.plusMinutes(15);
        activeSessions.put(sessionToken, expiraSesion);

        // Limpieza de sesiones expiradas en memoria
        limpiarSesionesExpiradas();

        return IniciarExpResponse.builder()
                .sessionToken(sessionToken)
                .inicioSesion(ahora)
                .expiraSesion(expiraSesion)
                .duracionSegundos(900)
                .numeroUso(nuevoUso.getNumeroUso())
                .cursos(cursosDetalle)
                .build();
    }

    @Override
    public ValidarSesionResponse validarSesion(ValidarSesionRequest request) {
        if (request == null || request.getSessionToken() == null) {
            return ValidarSesionResponse.builder().valida(false).segundosRestantes(0L).build();
        }

        LocalDateTime expira = activeSessions.get(request.getSessionToken());
        if (expira == null) {
            return ValidarSesionResponse.builder().valida(false).segundosRestantes(0L).build();
        }

        LocalDateTime ahora = LocalDateTime.now();
        if (ahora.isAfter(expira)) {
            activeSessions.remove(request.getSessionToken());
            return ValidarSesionResponse.builder().valida(false).segundosRestantes(0L).build();
        }

        long segundosRestantes = Duration.between(ahora, expira).getSeconds();
        return ValidarSesionResponse.builder()
                .valida(true)
                .segundosRestantes(segundosRestantes)
                .expiraSesion(expira)
                .build();
    }

    @Override
    public String extraerIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";

        // 1. Probar cabecera configurada en Nginx
        String ip = request.getHeader("X-Real-IP");
        if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip.trim())) {
            return normalizarIp(ip);
        }

        // 2. Probar cabecera estándar de proxy/CDN
        ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip.trim())) {
            return normalizarIp(ip);
        }

        // 3. Fallback directo del servlet
        return normalizarIp(request.getRemoteAddr());
    }

    private String normalizarIp(String ip) {
        if (ip == null) return "127.0.0.1";
        if (ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip.trim();
    }

    private List<Long> obtenerIdsCursosVistos(String correo, String ip, String cookieId) {
        List<ExperienciaUso> historial = experienciaUsoRepository.findHistorialVisitante(correo, ip, cookieId);
        return historial.stream()
                .filter(e -> e.getCursosVistos() != null)
                .flatMap(e -> e.getCursosVistos().stream())
                .distinct()
                .collect(Collectors.toList());
    }

    private void limpiarSesionesExpiradas() {
        LocalDateTime ahora = LocalDateTime.now();
        activeSessions.entrySet().removeIf(entry -> ahora.isAfter(entry.getValue()));
    }
}
