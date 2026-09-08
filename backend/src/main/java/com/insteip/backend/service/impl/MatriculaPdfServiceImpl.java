package com.insteip.backend.service.impl;

import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.MatriculaPdfService;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MatriculaPdfServiceImpl implements MatriculaPdfService {

    private final MatriculaRepository matriculaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ModuloRepository moduloRepository;
    private final VideoRepository videoRepository;

    @Value("${application.frontend.base-url:https://insteip.edu.pe}")
    private String frontendBaseUrl;

    @Override
    @Transactional(readOnly = true)
    public byte[] generarPdfMatricula(Long matriculaId, String correoSolicitante) {
        Matricula matricula = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula no encontrada con id: " + matriculaId));

        validarPermisoDescarga(matricula, correoSolicitante);
        return construirPdf(matricula);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generarMiPdfMatriculaPorCurso(Long cursoId, String correoAlumno) {
        Usuario alumno = usuarioRepository.findByCorreo(correoAlumno)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con correo: " + correoAlumno));

        Matricula matricula = matriculaRepository.findByUsuarioIdAndCursoId(alumno.getId(), cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró matrícula activa para este curso."));

        return construirPdf(matricula);
    }

    private void validarPermisoDescarga(Matricula matricula, String correoSolicitante) {
        if (correoSolicitante == null || correoSolicitante.isBlank()) {
            return;
        }

        Usuario solicitante = usuarioRepository.findByCorreo(correoSolicitante).orElse(null);
        if (solicitante == null) {
            return;
        }

        String rol = solicitante.getRol() != null ? solicitante.getRol().getNombre() : "";
        if ("ADMINISTRADOR".equalsIgnoreCase(rol)) {
            return; // Admin can download anything
        }

        boolean esElAlumno = matricula.getUsuario() != null &&
                matricula.getUsuario().getId().equals(solicitante.getId());
        
        boolean esElDocente = matricula.getCurso() != null &&
                matricula.getCurso().getDocente() != null &&
                matricula.getCurso().getDocente().getId().equals(solicitante.getId());

        if (!esElAlumno && !esElDocente) {
            throw new BadRequestException("No tiene permisos para descargar esta ficha de matrícula.");
        }
    }

    private byte[] construirPdf(Matricula matricula) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            // A4 Portrait
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new MatriculaPdfPageBorder());

            document.open();

            // Institutional Color Palette
            Color primaryNavy = new Color(0, 52, 102);     // #003466
            Color secondaryGreen = new Color(0, 110, 28);  // #006e1c
            Color accentGold = new Color(180, 83, 9);      // Amber 700 #b45309
            Color darkText = new Color(30, 41, 59);        // Slate 800 #1e293b
            Color mutedGray = new Color(100, 116, 139);    // Slate 500 #64748b
            Color bgLightBlue = new Color(241, 245, 249);  // Slate 100 #f1f5f9
            Color bgGreenLight = new Color(240, 253, 244); // Emerald 50 #f0fdf4
            Color borderGreen = new Color(134, 239, 172);  // Emerald 300 #86efac

            // Typography Fonts
            Font fontHeaderTitle = new Font(Font.HELVETICA, 13, Font.BOLD, primaryNavy);
            Font fontHeaderSubtitle = new Font(Font.HELVETICA, 8, Font.NORMAL, mutedGray);
            Font fontDocTitle = new Font(Font.HELVETICA, 15, Font.BOLD, primaryNavy);
            Font fontDocSub = new Font(Font.HELVETICA, 9, Font.BOLD, secondaryGreen);
            Font fontSectionTitle = new Font(Font.HELVETICA, 10, Font.BOLD, primaryNavy);
            Font fontLabel = new Font(Font.HELVETICA, 8, Font.BOLD, mutedGray);
            Font fontValue = new Font(Font.HELVETICA, 9, Font.NORMAL, darkText);
            Font fontValueBold = new Font(Font.HELVETICA, 9, Font.BOLD, darkText);
            Font fontHighlight = new Font(Font.HELVETICA, 11, Font.BOLD, secondaryGreen);
            Font fontWarning = new Font(Font.HELVETICA, 9, Font.BOLD, accentGold);
            Font fontFooterNote = new Font(Font.HELVETICA, 7, Font.NORMAL, mutedGray);

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM/yyyy");

            Usuario alumno = matricula.getUsuario();
            Curso curso = matricula.getCurso();
            Usuario docente = curso != null ? curso.getDocente() : null;

            LocalDateTime fMatricula = matricula.getFechaMatricula() != null ? matricula.getFechaMatricula() : LocalDateTime.now();
            LocalDateTime fExpiracion = matricula.getFechaExpiracion() != null ? matricula.getFechaExpiracion() : fMatricula.plusMonths(12);

            String matriculaCodigo = String.format("MAT-%d-%05d", fMatricula.getYear(), matricula.getId());

            // 1. TOP INSTITUTIONAL HEADER (Logo + Institution Titles + Enrollment Number Box)
            PdfPTable headerTable = new PdfPTable(3);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{2.2f, 4.8f, 3.0f});

            // Logo Cell
            PdfPCell logoCell = new PdfPCell();
            logoCell.setBorder(PdfPCell.NO_BORDER);
            logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            try {
                Path logoPath = Paths.get("..", "frontend", "src", "assets", "insteip-logo.png").toAbsolutePath().normalize();
                if (!Files.exists(logoPath)) {
                    logoPath = Paths.get(System.getProperty("user.dir"), "frontend", "src", "assets", "insteip-logo.png").toAbsolutePath().normalize();
                }
                if (Files.exists(logoPath)) {
                    Image logoImg = Image.getInstance(logoPath.toString());
                    logoImg.scaleToFit(110, 45);
                    logoCell.addElement(logoImg);
                } else {
                    Paragraph logoText = new Paragraph("INSTEIP", new Font(Font.HELVETICA, 18, Font.BOLD, primaryNavy));
                    logoCell.addElement(logoText);
                }
            } catch (Exception e) {
                Paragraph logoText = new Paragraph("INSTEIP", new Font(Font.HELVETICA, 18, Font.BOLD, primaryNavy));
                logoCell.addElement(logoText);
            }
            headerTable.addCell(logoCell);

            // Title Cell
            PdfPCell titleCell = new PdfPCell();
            titleCell.setBorder(PdfPCell.NO_BORDER);
            titleCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            Paragraph instName = new Paragraph("INSTITUTO DE TECNOLOGÍA E INNOVACIÓN PROFESIONAL", fontHeaderTitle);
            Paragraph instSubtitle = new Paragraph("SISTEMA OFICIAL DE REGISTRO Y CONTROL ACADÉMICO", fontHeaderSubtitle);
            titleCell.addElement(instName);
            titleCell.addElement(instSubtitle);
            headerTable.addCell(titleCell);

            // Enrollment Badge Cell
            PdfPCell badgeCell = new PdfPCell();
            badgeCell.setBorder(PdfPCell.BOX);
            badgeCell.setBorderColor(primaryNavy);
            badgeCell.setBorderWidth(1.2f);
            badgeCell.setBackgroundColor(bgLightBlue);
            badgeCell.setPadding(6f);
            badgeCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            badgeCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

            Paragraph badgeTitle = new Paragraph("FICHA DE MATRÍCULA", new Font(Font.HELVETICA, 8, Font.BOLD, primaryNavy));
            badgeTitle.setAlignment(Element.ALIGN_CENTER);
            Paragraph badgeNumber = new Paragraph(matriculaCodigo, new Font(Font.HELVETICA, 10, Font.BOLD, secondaryGreen));
            badgeNumber.setAlignment(Element.ALIGN_CENTER);
            Paragraph badgeEmision = new Paragraph("Emisión: " + LocalDateTime.now().format(df), new Font(Font.HELVETICA, 7, Font.NORMAL, darkText));
            badgeEmision.setAlignment(Element.ALIGN_CENTER);

            badgeCell.addElement(badgeTitle);
            badgeCell.addElement(badgeNumber);
            badgeCell.addElement(badgeEmision);
            headerTable.addCell(badgeCell);

            document.add(headerTable);
            document.add(new Paragraph(" "));

            // 2. DOCUMENT TITLE BANNER
            PdfPTable bannerTable = new PdfPTable(1);
            bannerTable.setWidthPercentage(100);
            PdfPCell bannerCell = new PdfPCell();
            bannerCell.setBackgroundColor(primaryNavy);
            bannerCell.setPaddingTop(6f);
            bannerCell.setPaddingBottom(6f);
            bannerCell.setHorizontalAlignment(Element.ALIGN_CENTER);

            Paragraph bannerText = new Paragraph("FICHA CONSOLIDADA DE MATRÍCULA Y CONSTANCIA DE ACCESO ACADÉMICO", new Font(Font.HELVETICA, 11, Font.BOLD, Color.WHITE));
            bannerText.setAlignment(Element.ALIGN_CENTER);
            bannerCell.addElement(bannerText);
            bannerTable.addCell(bannerCell);
            document.add(bannerTable);

            document.add(new Paragraph(" "));

            // 3. STUDENT INFORMATION BLOCK
            PdfPTable studentTable = new PdfPTable(2);
            studentTable.setWidthPercentage(100);
            studentTable.setWidths(new float[]{1.0f, 1.0f});

            PdfPCell secEstudiante = new PdfPCell(new Phrase("1. DATOS DEL ESTUDIANTE MATRICULADO", fontSectionTitle));
            secEstudiante.setColspan(2);
            secEstudiante.setBackgroundColor(bgLightBlue);
            secEstudiante.setPadding(4f);
            secEstudiante.setBorderColor(new Color(203, 213, 225));
            studentTable.addCell(secEstudiante);

            studentTable.addCell(createDataCell("APELLIDOS Y NOMBRES:", (alumno.getApellidos() + " " + alumno.getNombres()).toUpperCase(), fontLabel, fontValueBold));
            studentTable.addCell(createDataCell("CORREO ELECTRÓNICO:", alumno.getCorreo(), fontLabel, fontValue));
            studentTable.addCell(createDataCell("TELÉFONO DE CONTACTO:", alumno.getTelefono() != null && !alumno.getTelefono().isBlank() ? alumno.getTelefono() : "No registrado", fontLabel, fontValue));
            studentTable.addCell(createDataCell("NIVEL DE SUSCRIPCIÓN / PLAN:", alumno.getNivelSuscripcion() != null ? alumno.getNivelSuscripcion().getNombre() : "Estándar", fontLabel, fontValue));

            document.add(studentTable);
            document.add(new Paragraph(" "));

            // 4. COURSE INFORMATION BLOCK
            PdfPTable courseTable = new PdfPTable(2);
            courseTable.setWidthPercentage(100);
            courseTable.setWidths(new float[]{1.2f, 0.8f});

            PdfPCell secCurso = new PdfPCell(new Phrase("2. INFORMACIÓN DEL PROGRAMA ACADÉMICO", fontSectionTitle));
            secCurso.setColspan(2);
            secCurso.setBackgroundColor(bgLightBlue);
            secCurso.setPadding(4f);
            secCurso.setBorderColor(new Color(203, 213, 225));
            courseTable.addCell(secCurso);

            courseTable.addCell(createDataCell("PROGRAMA / CURSO:", curso != null ? curso.getNombre().toUpperCase() : "N/A", fontLabel, fontValueBold));
            courseTable.addCell(createDataCell("DOCENTE TITULAR:", docente != null ? (docente.getNombres() + " " + docente.getApellidos()).toUpperCase() : "Asignado por la institución", fontLabel, fontValue));
            
            List<Modulo> modulos = moduloRepository.findByCursoIdOrderByOrdenAsc(curso != null ? curso.getId() : 0L);
            int totalClases = 0;
            for (Modulo m : modulos) {
                totalClases += videoRepository.findByModuloIdOrderByOrdenAsc(m.getId()).size();
            }

            courseTable.addCell(createDataCell("ESTRUCTURA CURRICULAR:", modulos.size() + " Módulos Lectivos  |  " + totalClases + " Clases grabadas", fontLabel, fontValue));
            courseTable.addCell(createDataCell("MODALIDAD DE ESTUDIO:", "100% Online Asíncrono - Plataforma 24/7", fontLabel, fontValue));

            document.add(courseTable);
            document.add(new Paragraph(" "));

            // 5. HIGHLIGHTED ACCESS PERIOD & 365 DAYS EXPIRATION BOX
            PdfPTable validityTable = new PdfPTable(1);
            validityTable.setWidthPercentage(100);

            PdfPCell validityCell = new PdfPCell();
            validityCell.setBackgroundColor(bgGreenLight);
            validityCell.setBorderColor(secondaryGreen);
            validityCell.setBorderWidth(1.5f);
            validityCell.setPadding(8f);

            Paragraph valHeader = new Paragraph("3. VIGENCIA Y PLAZO DE ACCESO A LA PLATAFORMA (365 DÍAS)", fontSectionTitle);
            valHeader.setSpacingAfter(4f);
            validityCell.addElement(valHeader);

            PdfPTable datesInner = new PdfPTable(3);
            datesInner.setWidthPercentage(100);
            datesInner.setWidths(new float[]{1.0f, 1.0f, 1.2f});

            datesInner.addCell(createBorderLessCell("FECHA DE MATRÍCULA:", fMatricula.format(dtf), fontLabel, fontValueBold));
            datesInner.addCell(createBorderLessCell("PERÍODO DE VIGENCIA:", "365 Días Calendario (1 Año)", fontLabel, fontHighlight));
            datesInner.addCell(createBorderLessCell("FECHA LÍMITE DE EXPIRACIÓN:", fExpiracion.format(dtf), fontLabel, fontWarning));

            validityCell.addElement(datesInner);

            Paragraph termsNotice = new Paragraph("• El estudiante cuenta con 365 días continuos para completar la totalidad de clases, evaluaciones y tramitar su certificado de culminación.\n• Se emitirán alertas preventivas en el dashboard a los 30 y 7 días previos a la fecha límite.", fontFooterNote);
            termsNotice.setSpacingBefore(4f);
            validityCell.addElement(termsNotice);

            validityTable.addCell(validityCell);
            document.add(validityTable);
            document.add(new Paragraph(" "));

            // 6. CURRICULAR MODULES TABLE
            PdfPTable modulesTable = new PdfPTable(3);
            modulesTable.setWidthPercentage(100);
            modulesTable.setWidths(new float[]{0.8f, 4.0f, 1.2f});

            PdfPCell secModulos = new PdfPCell(new Phrase("4. PLAN TEMÁTICO CONSOLIDADO", fontSectionTitle));
            secModulos.setColspan(3);
            secModulos.setBackgroundColor(bgLightBlue);
            secModulos.setPadding(4f);
            secModulos.setBorderColor(new Color(203, 213, 225));
            modulesTable.addCell(secModulos);

            // Table headers
            modulesTable.addCell(createHeaderCell("N°"));
            modulesTable.addCell(createHeaderCell("MÓDULO LECTIVO"));
            modulesTable.addCell(createHeaderCell("N° CLASES"));

            if (modulos.isEmpty()) {
                PdfPCell emptyCell = new PdfPCell(new Phrase("El temario se encuentra en proceso de actualización curricular.", fontValue));
                emptyCell.setColspan(3);
                emptyCell.setPadding(6f);
                emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                modulesTable.addCell(emptyCell);
            } else {
                int index = 1;
                for (Modulo mod : modulos) {
                    int count = videoRepository.findByModuloIdOrderByOrdenAsc(mod.getId()).size();
                    PdfPCell c1 = new PdfPCell(new Phrase(String.valueOf(index++), fontValue));
                    c1.setHorizontalAlignment(Element.ALIGN_CENTER);
                    c1.setPadding(4f);
                    PdfPCell c2 = new PdfPCell(new Phrase(mod.getNombre(), fontValueBold));
                    c2.setPadding(4f);
                    PdfPCell c3 = new PdfPCell(new Phrase(count + " clases", fontValue));
                    c3.setHorizontalAlignment(Element.ALIGN_CENTER);
                    c3.setPadding(4f);

                    modulesTable.addCell(c1);
                    modulesTable.addCell(c2);
                    modulesTable.addCell(c3);
                }
            }

            document.add(modulesTable);
            document.add(new Paragraph(" "));

            // 7. FOOTER & VALIDATION SEAL
            PdfPTable sealTable = new PdfPTable(2);
            sealTable.setWidthPercentage(100);
            sealTable.setWidths(new float[]{1.0f, 1.0f});

            // Left: QR Code & Verification info
            PdfPCell sealLeft = new PdfPCell();
            sealLeft.setBorder(PdfPCell.NO_BORDER);
            sealLeft.setVerticalAlignment(Element.ALIGN_MIDDLE);

            try {
                String validationUrl = frontendBaseUrl + "/dashboard/mis-cursos";
                String qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=" +
                        java.net.URLEncoder.encode(validationUrl, java.nio.charset.StandardCharsets.UTF_8);
                Image qrImg = Image.getInstance(java.net.URI.create(qrUrl).toURL());
                qrImg.scaleAbsolute(50, 50);
                sealLeft.addElement(qrImg);
            } catch (Exception ignored) {}

            Paragraph qrInfo = new Paragraph("Validación de matrícula institucional en línea\nINSTEIP • Código Oficial: " + matriculaCodigo, fontFooterNote);
            sealLeft.addElement(qrInfo);
            sealTable.addCell(sealLeft);

            // Right: Academic Secretarial Signature / Stamp
            PdfPCell sealRight = new PdfPCell();
            sealRight.setBorder(PdfPCell.NO_BORDER);
            sealRight.setHorizontalAlignment(Element.ALIGN_CENTER);
            sealRight.setVerticalAlignment(Element.ALIGN_BOTTOM);

            Paragraph signLine = new Paragraph("___________________________________", new Font(Font.HELVETICA, 8, Font.BOLD, primaryNavy));
            signLine.setAlignment(Element.ALIGN_CENTER);
            Paragraph signTitle = new Paragraph("DIRECCIÓN ACADÉMICA Y REGISTRO", new Font(Font.HELVETICA, 8, Font.BOLD, primaryNavy));
            signTitle.setAlignment(Element.ALIGN_CENTER);
            Paragraph signSub = new Paragraph("INSTEIP - Formación Continua y Especializada", fontFooterNote);
            signSub.setAlignment(Element.ALIGN_CENTER);

            sealRight.addElement(signLine);
            sealRight.addElement(signTitle);
            sealRight.addElement(signSub);
            sealTable.addCell(sealRight);

            document.add(sealTable);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar la ficha consolidada de matrícula en PDF: " + e.getMessage(), e);
        }
    }

    private PdfPCell createDataCell(String label, String value, Font fLabel, Font fValue) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(4f);
        cell.setBorderColor(new Color(226, 232, 240));
        cell.addElement(new Paragraph(label, fLabel));
        cell.addElement(new Paragraph(value, fValue));
        return cell;
    }

    private PdfPCell createBorderLessCell(String label, String value, Font fLabel, Font fValue) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(PdfPCell.NO_BORDER);
        cell.setPadding(3f);
        cell.addElement(new Paragraph(label, fLabel));
        cell.addElement(new Paragraph(value, fValue));
        return cell;
    }

    private PdfPCell createHeaderCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, new Font(Font.HELVETICA, 8, Font.BOLD, Color.WHITE)));
        cell.setBackgroundColor(new Color(0, 52, 102));
        cell.setPadding(4f);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        return cell;
    }
}

class MatriculaPdfPageBorder extends PdfPageEventHelper {
    @Override
    public void onEndPage(PdfWriter writer, Document document) {
        PdfContentByte cb = writer.getDirectContent();
        cb.saveState();

        // Elegant outer frame
        cb.setColorStroke(new java.awt.Color(0, 52, 102));
        cb.setLineWidth(2f);
        cb.rectangle(20, 20, document.getPageSize().getWidth() - 40, document.getPageSize().getHeight() - 40);
        cb.stroke();

        // Inner thin emerald accent line
        cb.setColorStroke(new java.awt.Color(0, 110, 28));
        cb.setLineWidth(0.8f);
        cb.rectangle(24, 24, document.getPageSize().getWidth() - 48, document.getPageSize().getHeight() - 48);
        cb.stroke();

        cb.restoreState();
    }
}
