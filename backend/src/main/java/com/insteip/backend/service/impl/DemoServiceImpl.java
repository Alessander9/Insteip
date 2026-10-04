package com.insteip.backend.service.impl;

import com.insteip.backend.domain.dto.demo.DemoActivarRequest;
import com.insteip.backend.domain.dto.demo.DemoActivarResponse;
import com.insteip.backend.domain.dto.demo.DemoCuentaDisponibleResponse;
import com.insteip.backend.domain.dto.demo.DemoCursoDto;
import com.insteip.backend.domain.entity.Curso;
import com.insteip.backend.domain.entity.DemoIpCurso;
import com.insteip.backend.domain.entity.DemoSesion;
import com.insteip.backend.domain.entity.Usuario;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.infrastructure.security.JwtService;
import com.insteip.backend.repository.CursoRepository;
import com.insteip.backend.repository.DemoIpCursoRepository;
import com.insteip.backend.repository.DemoSesionRepository;
import com.insteip.backend.repository.ModuloRepository;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.service.interfaces.DemoService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DemoServiceImpl implements DemoService {

    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final ModuloRepository moduloRepository;
    private final DemoIpCursoRepository demoIpCursoRepository;
    private final DemoSesionRepository demoSesionRepository;
    private final JwtService jwtService;

    private static final List<String> DEMO_EMAILS = List.of(
            "experienciainsteip1@insteip.com",
            "experienciainsteip2@insteip.com",
            "experienciainsteip3@insteip.com",
            "experienciainsteip4@insteip.com",
            "experienciainsteip5@insteip.com"
    );

    private static final long DEMO_SESSION_DURATION_MILLIS = 20 * 60 * 1000L; // 20 minutos

    public static String getClientIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        String cfIp = request.getHeader("CF-Connecting-IP");
        if (cfIp != null && !cfIp.isBlank()) {
            return cfIp.trim();
        }
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @Override
    @Transactional(readOnly = true)
    public DemoCuentaDisponibleResponse obtenerCuentaYCursosDisponibles(HttpServletRequest request) {
        String clientIp = getClientIp(request);
        log.info("Consulta de cuenta demo disponible para IP: {}", clientIp);

        // 1. Obtener cursos ya consumidos por esta IP
        List<DemoIpCurso> cursosVistosIp = demoIpCursoRepository.findByIpAddress(clientIp);
        Set<Long> vistosIds = cursosVistosIp.stream()
                .map(d -> d.getCurso().getId())
                .collect(Collectors.toSet());

        // 2. Obtener cursos activos del catálogo (excluyendo Excel o pruebas)
        List<Curso> cursos = cursoRepository.findByEstadoTrue().stream()
                .filter(c -> c.getNombre() == null || !c.getNombre().toLowerCase().contains("excel"))
                .collect(Collectors.toList());

        List<DemoCursoDto> cursosDto = cursos.stream().map(c -> {
            int modulosCount = moduloRepository.findByCursoIdOrderByOrdenAsc(c.getId()).size();
            boolean yaVisto = vistosIds.contains(c.getId());
            return DemoCursoDto.builder()
                    .id(c.getId())
                    .nombre(c.getNombre())
                    .descripcion(c.getDescripcion())
                    .imagenPortada(c.getImagenPortada())
                    .nivelSuscripcion(c.getNivelesSuscripcion() != null && !c.getNivelesSuscripcion().isEmpty() ? c.getNivelesSuscripcion().get(0).getNombre() : "BASICO")
                    .totalModulos(modulosCount)
                    .yaVisto(yaVisto)
                    .build();
        }).collect(Collectors.toList());

        boolean todosCursosVistos = !cursosDto.isEmpty() && cursosDto.stream().allMatch(DemoCursoDto::isYaVisto);

        // 3. Asignar la cuenta demo con menos sesiones activas
        LocalDateTime now = LocalDateTime.now();
        String mejorEmail = DEMO_EMAILS.get(0);
        long minSesiones = Long.MAX_VALUE;

        for (String email : DEMO_EMAILS) {
            long activas = demoSesionRepository.countByCuentaDemoAndExpiraAfter(email, now);
            if (activas < minSesiones) {
                minSesiones = activas;
                mejorEmail = email;
            }
        }

        final String emailSeleccionado = mejorEmail;
        Usuario demoUser = usuarioRepository.findByCorreo(emailSeleccionado)
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta demo no encontrada: " + emailSeleccionado));

        // Generar token temporal de selección (30 min)
        String tokenTemporal = jwtService.generateDemoToken(
                demoUser.getId(),
                demoUser.getCorreo(),
                demoUser.getRol().getNombre(),
                Collections.emptyList(),
                30 * 60 * 1000L
        );

        return DemoCuentaDisponibleResponse.builder()
                .tokenTemporal(tokenTemporal)
                .correoAsignado(emailSeleccionado)
                .cursos(cursosDto)
                .todosCursosVistos(todosCursosVistos)
                .totalCursosDisponibles(cursosDto.size())
                .build();
    }

    @Override
    @Transactional
    public DemoActivarResponse activarDemo(DemoActivarRequest request, String bearerToken, HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        log.info("Solicitud de activación demo desde IP: {} con cursos: {}", clientIp, request.getCursoIds());

        if (request.getCursoIds() == null || request.getCursoIds().size() != 2) {
            throw new BadRequestException("Debes seleccionar exactamente 2 cursos para tu Experiencia INSTEIP.");
        }

        Long cursoId1 = request.getCursoIds().get(0);
        Long cursoId2 = request.getCursoIds().get(1);

        if (cursoId1.equals(cursoId2)) {
            throw new BadRequestException("Debes seleccionar dos cursos distintos.");
        }

        // 1. Validar que la IP NO haya consumido ninguno de estos 2 cursos
        if (demoIpCursoRepository.existsByIpAddressAndCursoId(clientIp, cursoId1)) {
            Curso c1 = cursoRepository.findById(cursoId1).orElse(null);
            String nombre = c1 != null ? c1.getNombre() : "ID " + cursoId1;
            throw new BadRequestException("El curso '" + nombre + "' ya fue probado anteriormente desde esta conexión. Elige otro curso disponible.");
        }

        if (demoIpCursoRepository.existsByIpAddressAndCursoId(clientIp, cursoId2)) {
            Curso c2 = cursoRepository.findById(cursoId2).orElse(null);
            String nombre = c2 != null ? c2.getNombre() : "ID " + cursoId2;
            throw new BadRequestException("El curso '" + nombre + "' ya fue probado anteriormente desde esta conexión. Elige otro curso disponible.");
        }

        // 2. Validar que existan ambos cursos
        Curso curso1 = cursoRepository.findById(cursoId1)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado: " + cursoId1));
        Curso curso2 = cursoRepository.findById(cursoId2)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado: " + cursoId2));

        // 3. Extraer usuario del token
        String token = bearerToken != null && bearerToken.startsWith("Bearer ") ? bearerToken.substring(7) : bearerToken;
        String correo = token != null ? jwtService.extractUsername(token) : null;
        Usuario usuario = null;
        if (correo != null) {
            usuario = usuarioRepository.findByCorreo(correo).orElse(null);
        }

        if (usuario == null) {
            usuario = usuarioRepository.findByCorreo(DEMO_EMAILS.get(0))
                    .orElseThrow(() -> new ResourceNotFoundException("Cuenta demo no disponible"));
        }

        // 4. Registrar cursos para esta IP (Bloqueo persistente)
        demoIpCursoRepository.save(DemoIpCurso.builder()
                .ipAddress(clientIp)
                .curso(curso1)
                .build());

        demoIpCursoRepository.save(DemoIpCurso.builder()
                .ipAddress(clientIp)
                .curso(curso2)
                .build());

        // 5. Registrar sesión activa en demo_sesiones
        LocalDateTime expira = LocalDateTime.now().plusSeconds(DEMO_SESSION_DURATION_MILLIS / 1000);
        demoSesionRepository.save(DemoSesion.builder()
                .cuentaDemo(usuario.getCorreo())
                .cursoId1(cursoId1)
                .cursoId2(cursoId2)
                .inicio(LocalDateTime.now())
                .expira(expira)
                .ip(clientIp)
                .userAgent(httpRequest != null ? httpRequest.getHeader("User-Agent") : null)
                .build());

        // 6. Generar token definitivo de 20 minutos con demoCursoIds embebidos
        List<Long> selectedIds = List.of(cursoId1, cursoId2);
        String finalToken = jwtService.generateDemoToken(
                usuario.getId(),
                usuario.getCorreo(),
                usuario.getRol().getNombre(),
                selectedIds,
                DEMO_SESSION_DURATION_MILLIS
        );

        return DemoActivarResponse.builder()
                .token(finalToken)
                .expiraEnSegundos(DEMO_SESSION_DURATION_MILLIS / 1000)
                .demoCursoIds(selectedIds)
                .correo(usuario.getCorreo())
                .build();
    }
}
