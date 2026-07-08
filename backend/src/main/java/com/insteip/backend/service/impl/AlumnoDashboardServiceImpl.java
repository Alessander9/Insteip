package com.insteip.backend.service.impl;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.dto.*;
import com.insteip.backend.entity.*;
import com.insteip.backend.exception.ResourceNotFoundException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.AlumnoDashboardService;
import com.insteip.backend.util.ProgresoAcademicoUtils;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlumnoDashboardServiceImpl implements AlumnoDashboardService {

    private final UsuarioRepository usuarioRepository;

    private final MatriculaRepository matriculaRepository;

    private final CertificadoRepository certificadoRepository;

    private final CursoRepository cursoRepository;

    private final ModuloRepository moduloRepository;

    private final VideoRepository videoRepository;

    private final MaterialRepository materialRepository;

    private final AvanceVideoRepository avanceVideoRepository;

    private final AvanceCursoRepository avanceCursoRepository;

    @Override
    public AlumnoDashboardMetrics getMetrics(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<Matricula> matriculas = matriculaRepository.findByUsuarioIdAndEstadoTrue(usuario.getId());
        long totalCursos = matriculas.size();

        long completados = 0;
        for (Matricula matricula : matriculas) {
            AvanceCurso avance = avanceCursoRepository.findByUsuarioIdAndCursoId(usuario.getId(), matricula.getCurso().getId())
                    .orElse(null);
            avance = normalizeAvanceCursoIfNeeded(usuario, matricula.getCurso(), avance);
            if (avance != null) {
                if (avance.getCompletado() || isCursoCompletado(usuario.getId(), matricula.getCurso())) {
                    completados++;
                }
            } else {
                if (isCursoCompletado(usuario.getId(), matricula.getCurso())) {
                    completados++;
                }
            }
        }

        long totalCertificados = certificadoRepository.findByUsuarioId(usuario.getId()).size();

        return new AlumnoDashboardMetrics(totalCursos, completados, totalCertificados);
    }

    @Override
    public List<AlumnoCursoResponse> getEnrolledCursos(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<Matricula> matriculas = matriculaRepository.findByUsuarioIdAndEstadoTrue(usuario.getId());

        return matriculas.stream().map(matricula -> {
            Curso curso = matricula.getCurso();
            AvanceCurso avanceRecord = avanceCursoRepository.findByUsuarioIdAndCursoId(usuario.getId(), curso.getId())
                    .orElse(null);
            avanceRecord = normalizeAvanceCursoIfNeeded(usuario, curso, avanceRecord);
            
            BigDecimal avance;
            boolean completado;
            
            if (avanceRecord != null) {
                avance = avanceRecord.getPorcentajeAvance();
                completado = avanceRecord.getCompletado();
                if (!completado && isCursoCompletado(usuario.getId(), curso)) {
                    avance = BigDecimal.valueOf(100.00).setScale(2, RoundingMode.HALF_UP);
                    completado = true;
                }
            } else {
                avance = getCursoAvance(usuario.getId(), curso);
                completado = isCursoCompletado(usuario.getId(), curso);
            }

            return new AlumnoCursoResponse(
                    curso.getId(),
                    curso.getNombre(),
                    curso.getDescripcion(),
                    curso.getImagenPortada(),
                    formatNivelesSuscripcion(curso.getNivelesSuscripcion()),
                    avance,
                    completado,
                    matricula.getFechaMatricula()
            );
        }).collect(Collectors.toList());
    }

    @Override
    public List<AlumnoCertificadoResponse> getCertificados(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<Certificado> certificados = certificadoRepository.findByUsuarioId(usuario.getId());

        return certificados.stream().map(c -> new AlumnoCertificadoResponse(
                c.getId(),
                c.getCodigo(),
                c.getCurso().getNombre(),
                c.getFechaEmision(),
                c.getArchivoPdf() == null || c.getArchivoPdf().isBlank()
                        ? "http://localhost:8081/api/certificados/" + c.getId() + "/download"
                        : c.getArchivoPdf(),
                c.getUrlValidacion() == null || c.getUrlValidacion().isBlank()
                        ? "http://localhost:4200/certificados/validar/" + c.getCodigo()
                        : c.getUrlValidacion()
        )).collect(Collectors.toList());
    }

    @Override
    public AlumnoPlayCourseResponse getPlayCourse(String correo, Long cursoId) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado"));

        boolean isEnrolled = matriculaRepository.existsByUsuarioIdAndCursoIdAndEstadoTrue(usuario.getId(), cursoId);
        if (!isEnrolled) {
            throw new RuntimeException("No estás matriculado en este curso.");
        }

        List<Modulo> modulos = moduloRepository.findByCursoIdOrderByOrdenAsc(cursoId);
        List<AlumnoPlayModulo> playModulos = new ArrayList<>();

        for (Modulo modulo : modulos) {
            if (!modulo.getEstado()) continue;

            List<Video> videos = videoRepository.findByModuloIdOrderByOrdenAsc(modulo.getId());
            List<AlumnoPlayVideo> playVideos = new ArrayList<>();

            for (Video video : videos) {
                if (!video.getEstado()) continue;

                AvanceVideo avance = avanceVideoRepository.findByUsuarioIdAndVideoId(usuario.getId(), video.getId())
                        .orElse(null);
                avance = normalizeAvanceVideoIfNeeded(avance, video);

                int ultimoSegundo = avance != null ? avance.getUltimoSegundo() : 0;
                BigDecimal porcentajeVisto = avance != null ? avance.getPorcentajeVisto() : BigDecimal.ZERO;
                boolean completado = ProgresoAcademicoUtils.isVideoCompletado(video, avance);

                playVideos.add(new AlumnoPlayVideo(
                        video.getId(),
                        video.getTitulo(),
                        video.getDescripcion(),
                        video.getYoutubeUrl(),
                        video.getYoutubeId(),
                        video.getDuracionSegundos(),
                        video.getOrden(),
                        ultimoSegundo,
                        porcentajeVisto,
                        completado
                ));
            }

            List<Material> materiales = materialRepository.findByModuloId(modulo.getId());
            List<AlumnoPlayMaterial> playMateriales = materiales.stream()
                    .filter(material -> material.getEstado())
                    .map(m -> new AlumnoPlayMaterial(
                            m.getId(),
                            m.getNombre(),
                            m.getArchivoUrl(),
                            m.getTipoArchivo(),
                            m.getPesoBytes()
                    )).collect(Collectors.toList());

            playModulos.add(new AlumnoPlayModulo(
                    modulo.getId(),
                    modulo.getNombre(),
                    modulo.getDescripcion(),
                    modulo.getOrden(),
                    playVideos,
                    playMateriales
            ));
        }

        return new AlumnoPlayCourseResponse(
                curso.getId(),
                curso.getNombre(),
                curso.getDescripcion(),
                curso.getImagenPortada(),
                formatNivelesSuscripcion(curso.getNivelesSuscripcion()),
                playModulos
        );
    }

    private BigDecimal getCursoAvance(Long usuarioId, Curso curso) {
        List<Modulo> modulos = moduloRepository.findByCursoIdOrderByOrdenAsc(curso.getId());
        int totalVideos = 0;
        int completedVideos = 0;

        for (Modulo modulo : modulos) {
            if (!modulo.getEstado()) continue;
            List<Video> videos = videoRepository.findByModuloIdOrderByOrdenAsc(modulo.getId());
            for (Video video : videos) {
                if (!video.getEstado()) continue;
                totalVideos++;
                AvanceVideo avance = avanceVideoRepository.findByUsuarioIdAndVideoId(usuarioId, video.getId())
                        .orElse(null);
                if (ProgresoAcademicoUtils.isVideoCompletado(video, avance)) {
                    completedVideos++;
                }
            }
        }

        if (totalVideos == 0) return BigDecimal.valueOf(100.00).setScale(2, RoundingMode.HALF_UP);
        double pct = (completedVideos * 100.0) / totalVideos;
        return BigDecimal.valueOf(pct).setScale(2, RoundingMode.HALF_UP);
    }

    private boolean isCursoCompletado(Long usuarioId, Curso curso) {
        List<Modulo> modulos = moduloRepository.findByCursoIdOrderByOrdenAsc(curso.getId());
        int totalVideos = 0;
        int completedVideos = 0;

        for (Modulo modulo : modulos) {
            if (!modulo.getEstado()) continue;
            List<Video> videos = videoRepository.findByModuloIdOrderByOrdenAsc(modulo.getId());
            for (Video video : videos) {
                if (!video.getEstado()) continue;
                totalVideos++;
                AvanceVideo avance = avanceVideoRepository.findByUsuarioIdAndVideoId(usuarioId, video.getId())
                        .orElse(null);
                if (ProgresoAcademicoUtils.isVideoCompletado(video, avance)) {
                    completedVideos++;
                }
            }
        }

        return completedVideos == totalVideos;
    }

    private String formatNivelesSuscripcion(List<NivelSuscripcion> niveles) {
        if (niveles == null || niveles.isEmpty()) {
            return "Ninguno";
        }
        return niveles.stream()
                .map(n -> {
                    String name = n.getNombre().toUpperCase();
                    if (name.equals("BASICO")) return "Básico";
                    if (name.equals("INTERMEDIO")) return "Intermedio";
                    if (name.equals("PREMIUM")) return "Premium";
                    return n.getNombre();
                })
                .collect(Collectors.joining(" • "));
    }

    private AvanceVideo normalizeAvanceVideoIfNeeded(AvanceVideo avance, Video video) {
        if (avance == null) return null;

        int duration = ProgresoAcademicoUtils.resolveDuracionVideo(video);
        boolean shouldBeComplete = ProgresoAcademicoUtils.isVideoCompletado(video, avance);
        boolean needsNormalization = shouldBeComplete && (
                !Boolean.TRUE.equals(avance.getCompletado())
                || (avance.getUltimoSegundo() != null && avance.getUltimoSegundo() < duration)
                || (avance.getPorcentajeVisto() != null && avance.getPorcentajeVisto().doubleValue() < 100.0)
        );

        if (needsNormalization) {
            avance.setUltimoSegundo(duration);
            avance.setPorcentajeVisto(BigDecimal.valueOf(100).setScale(2, RoundingMode.HALF_UP));
            avance.setCompletado(true);
            avance.setFechaActualizacion(java.time.LocalDateTime.now());
            return avanceVideoRepository.save(avance);
        }

        return avance;
    }

    private AvanceCurso normalizeAvanceCursoIfNeeded(Usuario usuario, Curso curso, AvanceCurso avanceCurso) {
        boolean shouldBeComplete = isCursoCompletado(usuario.getId(), curso);
        if (!shouldBeComplete) return avanceCurso;

        if (avanceCurso == null) {
            avanceCurso = AvanceCurso.builder()
                    .usuario(usuario)
                    .curso(curso)
                    .build();
        }

        boolean needsNormalization = !Boolean.TRUE.equals(avanceCurso.getCompletado())
                || avanceCurso.getPorcentajeAvance() == null
                || avanceCurso.getPorcentajeAvance().doubleValue() < 100.0;

        if (needsNormalization) {
            avanceCurso.setPorcentajeAvance(BigDecimal.valueOf(100.00).setScale(2, RoundingMode.HALF_UP));
            avanceCurso.setCompletado(true);
            avanceCurso.setFechaActualizacion(java.time.LocalDateTime.now());
            return avanceCursoRepository.save(avanceCurso);
        }

        return avanceCurso;
    }
}
