package com.insteip.backend.service.impl;

import com.insteip.backend.entity.*;
import com.insteip.backend.exception.ResourceNotFoundException;
import com.insteip.backend.exception.BadRequestException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.CertificadoService;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class CertificadoServiceImpl implements CertificadoService {

    @Autowired
    private CertificadoRepository certificadoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private ModuloRepository moduloRepository;

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private AvanceVideoRepository avanceVideoRepository;

    @Autowired
    private com.insteip.backend.service.interfaces.AuditoriaService auditoriaService;

    @Autowired
    private PlantillaCertificadoRepository plantillaCertificadoRepository;

    @org.springframework.beans.factory.annotation.Value("${application.storage.path}")
    private String storagePathSetting;

    private String UPLOADS_DIR;

    @jakarta.annotation.PostConstruct
    public void init() {
        java.nio.file.Path base = java.nio.file.Paths.get(storagePathSetting).toAbsolutePath().normalize();
        this.UPLOADS_DIR = base.resolve("certificados").toString();
        try {
            Files.createDirectories(java.nio.file.Paths.get(this.UPLOADS_DIR));
        } catch (IOException e) {
            System.err.println("Could not create certificates directory: " + e.getMessage());
        }
    }

    @Override
    public Certificado generarCertificado(Long usuarioId, Long cursoId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + usuarioId));
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id: " + cursoId));

        // 1. Check if course progress is 100%
        if (!isCursoCompletado(usuarioId, curso)) {
            throw new BadRequestException("El curso no ha sido completado al 100% todavía. Complete todos los videos para emitir su certificado.");
        }

        // 2. Return existing if already generated
        return certificadoRepository.findByUsuarioIdAndCursoId(usuarioId, cursoId)
                .orElseGet(() -> {
                    String codigoUnico = "INS-2026-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                    String numRegistro = "REG-" + System.currentTimeMillis() / 1000;
                    
                    Certificado cert = Certificado.builder()
                            .usuario(usuario)
                            .curso(curso)
                            .codigo(codigoUnico)
                            .archivoPdf("") // Updated below
                            .urlValidacion("http://localhost:4200/certificados/validar/" + codigoUnico)
                            .numeroRegistro(numRegistro)
                            .fechaEmision(LocalDateTime.now())
                            .build();

                    cert = certificadoRepository.save(cert);

                    // 3. Write physical PDF to local disk using OpenPDF
                    try {
                        writePdfOnDisk(cert, usuario, curso);
                    } catch (Exception e) {
                        certificadoRepository.delete(cert);
                        throw new RuntimeException("Error al generar el archivo físico del certificado: " + e.getMessage());
                    }

                    // 4. Update url with direct stream link
                    cert.setArchivoPdf("http://localhost:8081/api/certificados/" + cert.getId() + "/download");
                    Certificado saved = certificadoRepository.save(cert);
                    auditoriaService.registrarEvento("CERTIFICADO", "GENERAR", "Generado certificado para curso ID: " + cursoId + " y usuario ID: " + usuarioId);
                    return saved;
                });
    }

    @Override
    public Certificado obtenerCertificado(Long id) {
        return certificadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificado no encontrado con id: " + id));
    }

    @Override
    public Certificado validarCertificado(String codigo) {
        return certificadoRepository.findByCodigo(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Certificado inválido o no existente con código: " + codigo));
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
                if (avance != null && avance.getCompletado()) {
                    completedVideos++;
                }
            }
        }

        return completedVideos == totalVideos;
    }

    private void writePdfOnDisk(Certificado cert, Usuario usuario, Curso curso) throws DocumentException, IOException {
        String filename = cert.getCodigo() + ".pdf";
        Path targetPath = Paths.get(UPLOADS_DIR).resolve(filename);

        // A4 landscape size
        Document document = new Document(PageSize.A4.rotate(), 50, 50, 50, 50);
        PdfWriter.getInstance(document, Files.newOutputStream(targetPath));
        
        document.open();

        // 1. Add borders/frame structure
        // Let's keep a beautiful title header
        Font titleFont = new Font(Font.HELVETICA, 28, Font.BOLD, new Color(15, 23, 42));
        Font headerFont = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(71, 85, 105));
        Font nameFont = new Font(Font.HELVETICA, 24, Font.BOLD, new Color(15, 23, 42));
        Font bodyFont = new Font(Font.HELVETICA, 14, Font.NORMAL, new Color(51, 65, 85));
        Font courseFont = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(15, 23, 42));
        Font dateFont = new Font(Font.HELVETICA, 10, Font.ITALIC, new Color(100, 116, 139));
        Font metaFont = new Font(Font.COURIER, 9, Font.BOLD, new Color(148, 163, 184));

        Paragraph spacer = new Paragraph("\n");

        // Header Title
        Paragraph insteipHeader = new Paragraph("CAMPUS VIRTUAL INSTEIP", headerFont);
        insteipHeader.setAlignment(Element.ALIGN_CENTER);
        document.add(insteipHeader);
        document.add(spacer);

        // Certificate Title
        Paragraph mainTitle = new Paragraph("CERTIFICADO DE CULMINACIÓN", titleFont);
        mainTitle.setAlignment(Element.ALIGN_CENTER);
        document.add(mainTitle);
        document.add(spacer);
        document.add(spacer);

        // Body Text 1
        Paragraph certText1 = new Paragraph("Por cuanto se certifica que el estudiante", bodyFont);
        certText1.setAlignment(Element.ALIGN_CENTER);
        document.add(certText1);
        document.add(spacer);

        // Student Name
        Paragraph studentName = new Paragraph(usuario.getNombres().toUpperCase() + " " + usuario.getApellidos().toUpperCase(), nameFont);
        studentName.setAlignment(Element.ALIGN_CENTER);
        document.add(studentName);
        document.add(spacer);

        // Body Text 2
        Paragraph certText2 = new Paragraph("ha cursado y aprobado satisfactoriamente todos los módulos y evaluaciones del curso:", bodyFont);
        certText2.setAlignment(Element.ALIGN_CENTER);
        document.add(certText2);
        document.add(spacer);

        // Course Name
        Paragraph courseName = new Paragraph("\"" + curso.getNombre().toUpperCase() + "\"", courseFont);
        courseName.setAlignment(Element.ALIGN_CENTER);
        document.add(courseName);
        document.add(spacer);
        document.add(spacer);

        // Emit Date
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy");
        String formattedDate = cert.getFechaEmision().format(formatter);
        Paragraph emitDate = new Paragraph("Emitido en la plataforma el día " + formattedDate + ".", dateFont);
        emitDate.setAlignment(Element.ALIGN_CENTER);
        document.add(emitDate);
        
        document.add(spacer);

        // Director Signature Section
        String cargoDir = "Director Académico";
        String firmaDirText = "Firma del Director";

        PlantillaCertificado plantilla = plantillaCertificadoRepository.findAll().stream()
                .filter(p -> p.getActivo() != null && p.getActivo())
                .findFirst()
                .orElse(null);

        if (plantilla != null) {
            if (plantilla.getCargoDirector() != null && !plantilla.getCargoDirector().isBlank()) {
                cargoDir = plantilla.getCargoDirector();
            }
            if (plantilla.getFirmaDirector() != null && !plantilla.getFirmaDirector().isBlank()) {
                firmaDirText = plantilla.getFirmaDirector();
            }
        }

        Paragraph directorSignature = new Paragraph("_________________________\n" + firmaDirText + "\n" + cargoDir, bodyFont);
        directorSignature.setAlignment(Element.ALIGN_CENTER);
        document.add(directorSignature);
        document.add(spacer);

        // QR Code (Fetches from public generator API, falls back gracefully if offline)
        try {
            String qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=" 
                    + java.net.URLEncoder.encode(cert.getUrlValidacion(), java.nio.charset.StandardCharsets.UTF_8);
            Image qrImage = Image.getInstance(new java.net.URL(qrUrl));
            qrImage.setAlignment(Element.ALIGN_CENTER);
            document.add(qrImage);

            Paragraph qrText = new Paragraph("Escanee para validar", dateFont);
            qrText.setAlignment(Element.ALIGN_CENTER);
            document.add(qrText);
        } catch (Exception e) {
            System.err.println("Could not generate QR Code: " + e.getMessage());
            Paragraph offlineText = new Paragraph("[ Escanee QR para Validar en Servidor ]", dateFont);
            offlineText.setAlignment(Element.ALIGN_CENTER);
            document.add(offlineText);
        }

        document.add(spacer);

        // Metadata footer
        Paragraph metaFooter = new Paragraph(
            "CÓDIGO DE VALIDACIÓN: " + cert.getCodigo() + "  |  NÚMERO DE REGISTRO: " + cert.getNumeroRegistro() + "  |  VALIDAR EN: " + cert.getUrlValidacion(), 
            metaFont
        );
        metaFooter.setAlignment(Element.ALIGN_CENTER);
        document.add(metaFooter);

        document.close();
    }

    @Override
    public java.util.List<com.insteip.backend.dto.CertificadoResponseDTO> listarCertificados(String search) {
        return certificadoRepository.searchCertificados(search).stream()
                .map(cert -> new com.insteip.backend.dto.CertificadoResponseDTO(
                        cert.getId(),
                        cert.getUsuario().getId(),
                        cert.getCurso().getId(),
                        cert.getCodigo(),
                        cert.getArchivoPdf(),
                        cert.getUrlValidacion(),
                        cert.getNumeroRegistro(),
                        cert.getFechaEmision()
                ))
                .collect(java.util.stream.Collectors.toList());
    }
}
