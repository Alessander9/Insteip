const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function buildProposalPDF() {
  console.log('================================================================');
  console.log('  GENERANDO PROPUESTA TÉCNICO-ECONÓMICA PARA EL LIC. HECTOR TORRES');
  console.log('================================================================');

  const outputPath = path.join(__dirname, '../../Propuesta_Economica_Sistema_INSTEIP_Lic_Hector_Torres.pdf');
  const assetsDir = path.join(__dirname, '../../docs/assets/manual-assets');

  function getBase64Image(filename) {
    const fullPath = path.join(assetsDir, filename);
    if (fs.existsSync(fullPath)) {
      const ext = path.extname(filename).replace('.', '');
      const mime = ext === 'svg' ? 'image/svg+xml' : (ext === 'png' ? 'image/png' : 'image/jpeg');
      const data = fs.readFileSync(fullPath).toString('base64');
      return `data:${mime};base64,${data}`;
    }
    return '';
  }

  const imgDashboard = getBase64Image('02_admin_dashboard.png');
  const imgCursos = getBase64Image('03_admin_cursos.png');
  const imgStudentPlayer = getBase64Image('12_student_reproductor.png');
  const imgValidacionQR = getBase64Image('15_validacion_publica.png');

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Propuesta Técnico-Económica - Sistema INSTEIP - Lic. Héctor Torres</title>
  <style>
    /* Reset & Base Styles con compatibilidad total para impresión */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1E293B;
      background-color: #FFFFFF;
      font-size: 10pt;
      line-height: 1.55;
    }

    .page-break {
      page-break-before: always;
      margin-top: 20px;
    }

    /* Portada */
    .cover-box {
      background-color: #0F5B46;
      color: #FFFFFF;
      padding: 40px 35px 30px 35px;
      border-radius: 8px;
      margin-bottom: 25px;
    }

    .cover-badge {
      display: inline-block;
      background-color: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.4);
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 8.5pt;
      font-weight: bold;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #FFFFFF;
      margin-bottom: 15px;
    }

    .cover-brand {
      font-size: 22pt;
      font-weight: 800;
      letter-spacing: 2px;
      color: #FFFFFF;
      margin-bottom: 4px;
    }

    .cover-brand-sub {
      font-size: 9.5pt;
      color: #A7F3D0;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }

    .cover-main-title {
      font-size: 24pt;
      font-weight: 800;
      line-height: 1.25;
      color: #FFFFFF;
      margin-bottom: 12px;
    }

    .cover-desc {
      font-size: 11pt;
      color: #E2E8F0;
      line-height: 1.5;
      margin-bottom: 25px;
    }

    /* Tablas de Información (Reemplazo seguro de CSS Grid) */
    .table-layout {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }

    .table-layout td {
      vertical-align: top;
      padding: 6px;
    }

    .client-meta-box {
      background-color: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 8px;
      padding: 12px 16px;
    }

    .client-meta-label {
      font-size: 7.5pt;
      text-transform: uppercase;
      color: #94A3B8;
      font-weight: bold;
      letter-spacing: 0.8px;
      margin-bottom: 3px;
    }

    .client-meta-val {
      font-size: 11pt;
      font-weight: bold;
      color: #FFFFFF;
    }

    .client-meta-sub {
      font-size: 8.5pt;
      color: #CBD5E1;
    }

    /* Títulos */
    h2.section-title {
      font-size: 14pt;
      color: #0A3D2F;
      border-left: 5px solid #0F5B46;
      padding-left: 10px;
      margin-top: 22px;
      margin-bottom: 12px;
    }

    h3.sub-title {
      font-size: 11pt;
      color: #0F172A;
      margin-top: 14px;
      margin-bottom: 8px;
      font-weight: bold;
    }

    p {
      margin-bottom: 10px;
      color: #334155;
      text-align: justify;
    }

    strong {
      color: #0F172A;
    }

    /* Tarjetas Generales */
    .card {
      background-color: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 14px;
    }

    .card-highlight {
      border-left: 4px solid #0F5B46;
      background-color: #F8FAFC;
    }

    .card-gold {
      border-left: 4px solid #D97706;
      background-color: #FFFDF8;
      border-color: #FDE68A;
    }

    /* Roles */
    .role-box {
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      margin-bottom: 16px;
      background-color: #FFFFFF;
      overflow: hidden;
    }

    .role-header {
      padding: 8px 14px;
      font-weight: bold;
      font-size: 10.5pt;
      color: #FFFFFF;
    }

    .role-header.admin { background-color: #0F5B46; }
    .role-header.docente { background-color: #1E3A8A; }
    .role-header.alumno { background-color: #0D9488; }
    .role-header.publico { background-color: #6D28D9; }

    .role-content-table {
      width: 100%;
      border-collapse: collapse;
    }

    .role-content-table td {
      width: 50%;
      vertical-align: top;
      padding: 12px 16px;
    }

    .role-col-title {
      font-size: 8.5pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 8px;
    }

    .role-col-title.ver { color: #0D9488; }
    .role-col-title.hacer { color: #0F5B46; }

    ul.role-bullet-list {
      margin-left: 18px;
      padding-left: 0;
    }

    ul.role-bullet-list li {
      font-size: 9pt;
      color: #334155;
      margin-bottom: 6px;
      line-height: 1.45;
    }

    /* Módulos */
    .module-card {
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 10px;
      background-color: #FFFFFF;
    }

    .module-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .module-name {
      font-weight: bold;
      font-size: 10pt;
      color: #0F172A;
    }

    .module-badge {
      background-color: #E8F5EE;
      color: #0A3D2F;
      font-size: 7pt;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 10px;
      text-transform: uppercase;
    }

    .module-text {
      font-size: 8.8pt;
      color: #334155;
      line-height: 1.45;
    }

    .module-benefit {
      margin-top: 4px;
      background-color: #F8FAFC;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 8.2pt;
      color: #475569;
    }

    /* Tablas de Datos */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 14px;
      font-size: 8.8pt;
    }

    table.data-table th {
      background-color: #0F5B46;
      color: #FFFFFF;
      font-weight: bold;
      padding: 8px 10px;
      text-align: left;
      font-size: 8pt;
      text-transform: uppercase;
    }

    table.data-table td {
      padding: 7px 10px;
      border-bottom: 1px solid #E2E8F0;
      color: #334155;
      vertical-align: middle;
    }

    table.data-table tr:nth-child(even) {
      background-color: #F8FAFC;
    }

    table.data-table tr.total-row {
      background-color: #E8F5EE;
      font-weight: bold;
      color: #0A3D2F;
      border-top: 2px solid #0F5B46;
      border-bottom: 2px solid #0F5B46;
      font-size: 9.5pt;
    }

    table.data-table tr.total-row td {
      color: #0A3D2F;
    }

    .badge-status {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 7.2pt;
      font-weight: bold;
    }

    .badge-blue { background-color: #E0F2FE; color: #0369A1; }
    .badge-green { background-color: #DCFCE7; color: #15803D; }

    /* Capturas */
    .img-box {
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      overflow: hidden;
      background-color: #FFFFFF;
      margin-bottom: 10px;
    }

    .img-box img {
      width: 100%;
      height: 140px;
      object-fit: cover;
      display: block;
    }

    .img-box-caption {
      background-color: #F8FAFC;
      padding: 4px 8px;
      font-size: 7.8pt;
      color: #475569;
      text-align: center;
      font-style: italic;
      border-top: 1px solid #E2E8F0;
    }

    .firmas-table {
      width: 100%;
      margin-top: 25px;
      border-collapse: collapse;
    }

    .firmas-table td {
      width: 50%;
      text-align: center;
      padding: 10px 20px;
      vertical-align: top;
    }

    .linea-firma {
      border-top: 1.5px solid #1E293B;
      padding-top: 6px;
      font-weight: bold;
      font-size: 9.5pt;
      color: #0F172A;
    }
  </style>
</head>
<body>

  <!-- =====================================================================
       PORTADA
       ===================================================================== -->
  <div class="cover-box">
    <div class="cover-badge">PROPUESTA TÉCNICO - ECONÓMICA DE SERVICIOS</div>
    
    <div class="cover-brand">🌿 INSTEIP</div>
    <div class="cover-brand-sub">Instituto Superior de Terapias Integrales y Profesionales</div>

    <div class="cover-main-title">
      SISTEMA INTEGRAL DE GESTIÓN ACADÉMICA Y CAMPUS VIRTUAL
    </div>
    
    <div class="cover-desc">
      Plataforma tecnológica todo-en-uno diseñada para la transformación digital institucional, matrícula ágil de alumnos, enseñanza virtual 24/7, evaluación docente y certificación digital oficial con validación antifraude QR.
    </div>

    <table class="table-layout" style="margin-bottom: 15px;">
      <tr>
        <td style="width: 50%; padding-left: 0;">
          <div class="client-meta-box">
            <div class="client-meta-label">Presentado Exclusivamente A:</div>
            <div class="client-meta-val">LIC. HÉCTOR TORRES</div>
            <div class="client-meta-sub">Director General / Representante Institucional</div>
          </div>
        </td>
        <td style="width: 50%; padding-right: 0;">
          <div class="client-meta-box">
            <div class="client-meta-label">Institución:</div>
            <div class="client-meta-val">INSTITUTO INSTEIP</div>
            <div class="client-meta-sub">Sedes: Lima (Lince), Huánuco, Piura y Campus Online</div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="width: 50%; padding-left: 0;">
          <div class="client-meta-box">
            <div class="client-meta-label">Versión del Sistema:</div>
            <div class="client-meta-val">Edición Enterprise 2026 (v1.0)</div>
            <div class="client-meta-sub">Arquitectura Cloud de Alta Disponibilidad 24/7</div>
          </div>
        </td>
        <td style="width: 50%; padding-right: 0;">
          <div class="client-meta-box">
            <div class="client-meta-label">Fecha de Emisión & Vigencia:</div>
            <div class="client-meta-val">Septiembre 2026</div>
            <div class="client-meta-sub">Propuesta Formal con Validez de 30 Días</div>
          </div>
        </td>
      </tr>
    </table>

    <div style="font-size: 7.8pt; color: #CBD5E1; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 8px;">
      <strong>CONFIDENCIALIDAD:</strong> Documento reservado para la Dirección General de INSTEIP &bull; Lima, Perú.
    </div>
  </div>

  <!-- =====================================================================
       SECCIÓN 1: CARTA DE PRESENTACIÓN Y RESUMEN EJECUTIVO
       ===================================================================== -->
  <h2 class="section-title">1. Carta de Presentación y Resumen Ejecutivo</h2>

  <p><strong>Estimado Lic. Héctor Torres:</strong></p>

  <p>
    Es un placer presentarle la <strong>Propuesta Técnico-Económica para la Implementación del Sistema Integral de Gestión Académica y Campus Virtual de INSTEIP</strong>. En la actualidad, las instituciones líderes en formación y terapias integrales requieren herramientas digitales modernas que les permitan expandir sus matrículas a nivel nacional e internacional, brindar una experiencia formativa de primer nivel y automatizar las labores docentes y administrativas sin pagar mensualidades abusivas a plataformas de terceros.
  </p>

  <p>
    Esta solución ha sido desarrollada a la medida de la oferta académica de <strong>INSTEIP</strong> (Acupuntura China, Auriculoterapia, Digitopresión Mecánica, Masaje Terapéutico, Fitoterapia, Dietética y talleres de especialización). Integra un <strong>portal comercial de captación</strong>, un <strong>campus virtual 24/7</strong> para estudio a propio ritmo, un <strong>sistema de tareas y notas docentes</strong>, y una <strong>emisión de diplomas protegidos con código QR antifraude</strong>.
  </p>

  <div class="card card-highlight">
    <h3 style="color: #0A3D2F; font-size: 10pt; margin-bottom: 6px;">🎯 Beneficios Directos para INSTEIP:</h3>
    <table class="table-layout" style="margin-bottom: 0;">
      <tr>
        <td style="width: 50%; padding-left: 0;">
          <p style="margin-bottom: 4px; font-size: 8.8pt;"><strong>1. Cero Comisiones por Alumno:</strong> La plataforma es 100% propiedad de INSTEIP. No paga porcentajes por matrícula.</p>
          <p style="margin-bottom: 0; font-size: 8.8pt;"><strong>2. Expansión a Todo el Perú:</strong> Matrícula a alumnos de provincias y del exterior para estudiar online.</p>
        </td>
        <td style="width: 50%; padding-right: 0;">
          <p style="margin-bottom: 4px; font-size: 8.8pt;"><strong>3. Automatización Docente:</strong> Los profesores suben materiales, tareas y califican notas sin desorden en WhatsApp.</p>
          <p style="margin-bottom: 0; font-size: 8.8pt;"><strong>4. Prestigio y Validación QR:</strong> Los certificados se validan al instante escaneando el código QR con el celular.</p>
        </td>
      </tr>
    </table>
  </div>

  <!-- =====================================================================
       SECCIÓN 2: MAPA DE ROLES
       ===================================================================== -->
  <div class="page-break"></div>
  <h2 class="section-title">2. Mapa de Roles: ¿Qué puede ver y hacer cada perfil?</h2>
  <p>
    El sistema cuenta con una estructura de seguridad por <strong>Roles de Usuario</strong>. Cada usuario que ingresa a la plataforma accede únicamente a las opciones correspondientes a su perfil:
  </p>

  <!-- ROL ADMINISTRADOR -->
  <div class="role-box">
    <div class="role-header admin">
      👑 ROL ADMINISTRADOR / DIRECCIÓN GENERAL (Lic. Héctor Torres y Coordinación) &bull; Control Total 360°
    </div>
    <table class="role-content-table">
      <tr>
        <td style="border-right: 1px solid #E2E8F0;">
          <div class="role-col-title ver">👁️ ¿Qué puede VER el Administrador?</div>
          <ul class="role-bullet-list">
            <li><strong>Métricas en Vivo:</strong> Total de alumnos matriculados, docentes activos y cursos disponibles.</li>
            <li><strong>Directorio Central de Usuarios:</strong> Lista completa de alumnos y profesores con sus teléfonos y correos.</li>
            <li><strong>Catálogo Global de Cursos:</strong> Todos los diplomados, módulos temáticos, videoclases y materiales PDF.</li>
            <li><strong>Historial de Certificados:</strong> Registro de cada diploma emitido con fecha, código QR y nota.</li>
            <li><strong>Auditoría de Seguridad:</strong> Registro de quién ingresó al sistema, hora exacta y acciones hechas.</li>
            <li><strong>Estado del Servidor y Backups:</strong> Monitoreo de memoria, disco y copias de seguridad de la base de datos.</li>
          </ul>
        </td>
        <td>
          <div class="role-col-title hacer">⚡ ¿Qué puede HACER el Administrador?</div>
          <ul class="role-bullet-list">
            <li><strong>Matricular Alumnos:</strong> Inscribir o dar de baja estudiantes en cualquier curso con un solo clic.</li>
            <li><strong>Gestionar Plana Docente:</strong> Registrar nuevos profesores y asignarles la tutela de cursos.</li>
            <li><strong>Crear y Editar Cursos:</strong> Añadir diplomados, crear módulos, subir videos y manuales en PDF.</li>
            <li><strong>Emitir Certificados Oficiales:</strong> Generar diplomas digitales con código QR para egresados.</li>
            <li><strong>Enviar Comunicados:</strong> Redactar avisos a toda la escuela, solo a docentes o por curso.</li>
            <li><strong>Lanzar Pop-ups Promocionales:</strong> Publicar flyers emergentes en la web para vender talleres.</li>
            <li><strong>Generar Copias de Respaldo:</strong> Descargar backups completos de la información institucional.</li>
          </ul>
        </td>
      </tr>
    </table>
  </div>

  <!-- ROL DOCENTE -->
  <div class="role-box">
    <div class="role-header docente">
      👨‍🏫 ROL DOCENTE / PLANA ACADÉMICA (Profesores y Terapeutas) &bull; Gestión de Aula y Alumnos
    </div>
    <table class="role-content-table">
      <tr>
        <td style="border-right: 1px solid #E2E8F0;">
          <div class="role-col-title ver">👁️ ¿Qué puede VER el Docente?</div>
          <ul class="role-bullet-list">
            <li><strong>Sus Cursos Asignados:</strong> Exclusivamente las asignaturas que la Dirección le asignó enseñar.</li>
            <li><strong>Lista de sus Alumnos:</strong> Relación de estudiantes matriculados en sus aulas virtuales.</li>
            <li><strong>Avance de sus Alumnos:</strong> Porcentaje de videos y clases que ha completado cada estudiante.</li>
            <li><strong>Bandeja de Tareas Recibidas:</strong> Trabajos y archivos (PDF/Word) enviados por los alumnos.</li>
            <li><strong>Registro de Calificaciones:</strong> Notas asignadas y comentarios de retroalimentación otorgados.</li>
          </ul>
        </td>
        <td>
          <div class="role-col-title hacer">⚡ ¿Qué puede HACER el Docente?</div>
          <ul class="role-bullet-list">
            <li><strong>Organizar Contenido de Clase:</strong> Subir lecciones en video y lecturas clínicas en PDF.</li>
            <li><strong>Publicar Tareas y Asignaciones:</strong> Crear evaluaciones prácticas con fechas límites de entrega.</li>
            <li><strong>Descargar y Revisar Entregas:</strong> Abrir los documentos enviados por los estudiantes fácilmente.</li>
            <li><strong>Calificar sobre 20:</strong> Asignar la nota oficial a cada alumno según su desempeño.</li>
            <li><strong>Escribir Retroalimentación Pedagógica:</strong> Dejar observaciones y consejos formativos al alumno.</li>
          </ul>
        </td>
      </tr>
    </table>
  </div>

  <!-- ROL ALUMNO -->
  <div class="role-box">
    <div class="role-header alumno">
      🎓 ROL ALUMNO / ESTUDIANTE (Comunidad Estudiantil INSTEIP) &bull; Campus de Aprendizaje 24/7
    </div>
    <table class="role-content-table">
      <tr>
        <td style="border-right: 1px solid #E2E8F0;">
          <div class="role-col-title ver">👁️ ¿Qué puede VER el Alumno?</div>
          <ul class="role-bullet-list">
            <li><strong>Mis Cursos:</strong> Acceso a los diplomados en los que se encuentra formalmente matriculado.</li>
            <li><strong>Reproductor de Videoclases:</strong> Lista ordenada de lecciones en video HD con subtítulos.</li>
            <li><strong>Barra de Progreso Personal:</strong> Porcentaje de avance de estudio acumulado en cada materia.</li>
            <li><strong>Materiales Descargables:</strong> Manuales, diapositivas y guías anatómicas en PDF.</li>
            <li><strong>Sección de Tareas y Notas:</strong> Asignaciones pendientes, calificaciones y notas obtenidas.</li>
            <li><strong>Sus Certificados Oficiales:</strong> Diplomas ganados con código QR listos para descargar.</li>
          </ul>
        </td>
        <td>
          <div class="role-col-title hacer">⚡ ¿Qué puede HACER el Alumno?</div>
          <ul class="role-bullet-list">
            <li><strong>Estudiar a Propio Ritmo:</strong> Ver sus clases a cualquier hora desde su celular o laptop.</li>
            <li><strong>Descargar Guías en PDF:</strong> Guardar los manuales de estudio en su dispositivo.</li>
            <li><strong>Subir sus Tareas Resueltas:</strong> Adjuntar archivos de entrega en Word o PDF para calificación.</li>
            <li><strong>Descargar su Certificado QR:</strong> Obtener su diploma oficial al completar su formación.</li>
            <li><strong>Consultar al Asistente IA:</strong> Resolver dudas académicas o de horarios al instante con el Chatbot.</li>
          </ul>
        </td>
      </tr>
    </table>
  </div>

  <!-- ROL PUBLICO -->
  <div class="role-box">
    <div class="role-header publico">
      🌐 ROL VISITANTE / PÚBLICO GENERAL / EMPLEADORES Y PACIENTES &bull; Transparencia y Validación
    </div>
    <table class="role-content-table">
      <tr>
        <td style="border-right: 1px solid #E2E8F0;">
          <div class="role-col-title ver">👁️ ¿Qué puede VER el Público?</div>
          <ul class="role-bullet-list">
            <li><strong>Portal Institucional:</strong> Presentación de INSTEIP, trayectoria, sedes y docentes.</li>
            <li><strong>Catálogo Académico:</strong> Cursos presenciales en Lima/Lince y diplomados 100% online.</li>
            <li><strong>Fichas de Cursos y Temarios:</strong> Detalle de cada curso con descarga de temarios en PDF.</li>
            <li><strong>Validador QR Oficial:</strong> Pantalla web de consulta de autenticidad de diplomas.</li>
          </ul>
        </td>
        <td>
          <div class="role-col-title hacer">⚡ ¿Qué puede HACER el Público?</div>
          <ul class="role-bullet-list">
            <li><strong>Contactar por WhatsApp:</strong> Enlace directo a admisiones con un solo clic.</li>
            <li><strong>Escanear Códigos QR:</strong> Comprobar desde el celular la validez legal de un certificado.</li>
            <li><strong>Consultar al Chatbot 24/7:</strong> Preguntar dudas sobre inscripciones y tarifas.</li>
            <li><strong>Ingresar al Campus:</strong> Iniciar sesión si ya cuenta con una cuenta de estudiante o docente.</li>
          </ul>
        </td>
      </tr>
    </table>
  </div>

  <!-- =====================================================================
       SECCIÓN 3: MÓDULOS DEL SISTEMA
       ===================================================================== -->
  <div class="page-break"></div>
  <h2 class="section-title">3. Desglose de Módulos y Funcionalidades del Sistema</h2>
  <p>
    Cada módulo del sistema resuelve una necesidad operativa concreta de <strong>INSTEIP</strong>, reemplazando métodos manuales por procesos automáticos y seguros:
  </p>

  <div class="module-card">
    <div class="module-header">
      <div class="module-name">🌐 Módulo 1: Portal Web Comercial y Catálogo Dinámico</div>
      <span class="module-badge">Atracción y Ventas</span>
    </div>
    <div class="module-text">
      <strong>Función:</strong> Vitrina digital oficial de INSTEIP. Muestra la oferta académica, temarios descargables en PDF y botones directos a WhatsApp para cerrar inscripciones.
    </div>
    <div class="module-benefit">
      ✨ <strong>Beneficio:</strong> Proyecta máxima seriedad institucional y multiplica las solicitudes de matrícula.
    </div>
  </div>

  <div class="module-card">
    <div class="module-header">
      <div class="module-name">🔐 Módulo 2: Control de Accesos y Seguridad de Cuentas</div>
      <span class="module-badge">Seguridad y Privacidad</span>
    </div>
    <div class="module-text">
      <strong>Función:</strong> Administra el inicio de sesión con claves encriptadas. Asegura que solo los alumnos matriculados puedan ver sus clases y descargar materiales.
    </div>
    <div class="module-benefit">
      ✨ <strong>Beneficio:</strong> Protege sus videos contra la piratería y asegura la privacidad de los datos de los alumnos.
    </div>
  </div>

  <div class="module-card">
    <div class="module-header">
      <div class="module-name">📊 Módulo 3: Panel Gerencial y Métricas en Tiempo Real (Dashboard)</div>
      <span class="module-badge">Dirección General</span>
    </div>
    <div class="module-text">
      <strong>Función:</strong> Brinda a la Dirección una vista panorámica del instituto: total de alumnos, cursos activos, profesores y accesos rápidos a toda la administración.
    </div>
    <div class="module-benefit">
      ✨ <strong>Beneficio:</strong> Permite tomar decisiones estratégicas al instante sin esperar reportes manuales.
    </div>
  </div>

  <div class="module-card">
    <div class="module-header">
      <div class="module-name">👥 Módulo 4: Gestión de Alumnos y Matrícula Rápida</div>
      <span class="module-badge">Administración Escolar</span>
    </div>
    <div class="module-text">
      <strong>Función:</strong> Registra a los estudiantes con su DNI, teléfono y correo, y los matricula en uno o más diplomados en segundos con control de estado activo/inactivo.
    </div>
    <div class="module-benefit">
      ✨ <strong>Beneficio:</strong> Elimina el desorden de listas en cuadernos o archivos sueltos de Excel.
    </div>
  </div>

  <div class="module-card">
    <div class="module-header">
      <div class="module-name">👨‍🏫 Módulo 5: Gestión Docente y Asignación Académica</div>
      <span class="module-badge">Coordinación Docente</span>
    </div>
    <div class="module-text">
      <strong>Función:</strong> Registra a los profesores y les asigna sus cursos correspondientes para que puedan administrar sus lecciones y calificar a sus alumnos.
    </div>
    <div class="module-benefit">
      ✨ <strong>Beneficio:</strong> Delimita responsabilidades claras para cada profesor dentro de la plataforma.
    </div>
  </div>

  <div class="module-card">
    <div class="module-header">
      <div class="module-name">📚 Módulo 6: Gestor de Cursos, Módulos Temáticos y Materiales</div>
      <span class="module-badge">Gestión Curricular</span>
    </div>
    <div class="module-text">
      <strong>Función:</strong> Organiza los diplomados en módulos temáticos estructurados (ej. Meridianos, Puntos de Acupuntura), enlazando videos y documentos en PDF.
    </div>
    <div class="module-benefit">
      ✨ <strong>Beneficio:</strong> Estructura pedagógica impecable que facilita el aprendizaje progresivo del estudiante.
    </div>
  </div>

  <div class="module-card">
    <div class="module-header">
      <div class="module-name">🎬 Módulo 7: Aula Virtual & Reproductor Inteligente de Clases</div>
      <span class="module-badge">Campus 24/7</span>
    </div>
    <div class="module-text">
      <strong>Función:</strong> Reproductor de clases que guarda automáticamente el minuto exacto donde el alumno pausó su video, marca las clases completadas y mide el progreso.
    </div>
    <div class="module-benefit">
      ✨ <strong>Beneficio:</strong> Experiencia de estudio fluida similar a plataformas de streaming que eleva la satisfacción del alumno.
    </div>
  </div>

  <div class="module-card">
    <div class="module-header">
      <div class="module-name">📝 Módulo 8: Sistema de Tareas, Evaluaciones y Calificaciones</div>
      <span class="module-badge">Evaluación Pedagógica</span>
    </div>
    <div class="module-text">
      <strong>Función:</strong> Permite a los docentes publicar tareas prácticas, recibir archivos de los estudiantes (PDF/Word), calificar sobre 20 y escribir observaciones.
    </div>
    <div class="module-benefit">
      ✨ <strong>Beneficio:</strong> Garantiza la calidad técnica y clínica del egresado mediante evaluaciones comprobables.
    </div>
  </div>

  <div class="module-card">
    <div class="module-header">
      <div class="module-name">🎓 Módulo 9: Certificación Digital Inteligente con QR Antifraude</div>
      <span class="module-badge">Acreditación Oficial</span>
    </div>
    <div class="module-text">
      <strong>Función:</strong> Emite diplomas oficiales en PDF con diseño institucional y un código QR único. Al ser escaneado con cualquier celular, valida la autenticidad en tiempo real.
    </div>
    <div class="module-benefit">
      ✨ <strong>Beneficio:</strong> Da valor y respaldo legal a los diplomas de INSTEIP, impidiendo falsificaciones.
    </div>
  </div>

  <div class="module-card">
    <div class="module-header">
      <div class="module-name">📢 Módulo 10: Comunicados Segmentados y Pop-ups Promocionales</div>
      <span class="module-badge">Marketing y Comunicación</span>
    </div>
    <div class="module-text">
      <strong>Función:</strong> Envía avisos dirigidos a toda la comunidad o segmentados por rol/curso, y permite publicar banners emergentes con ofertas de nuevos talleres.
    </div>
    <div class="module-benefit">
      ✨ <strong>Beneficio:</strong> Canal de comunicación interna directo y herramienta de venta activa para cursos adicionales.
    </div>
  </div>

  <div class="module-card">
    <div class="module-header">
      <div class="module-name">🔔 Módulo 11: Centro de Notificaciones en Tiempo Real (Campanita)</div>
      <span class="module-badge">Interacción en Vivo</span>
    </div>
    <div class="module-text">
      <strong>Función:</strong> Alerta al alumno cuando su docente sube una nueva clase, califica una tarea o publica un comunicado importante.
    </div>
    <div class="module-benefit">
      ✨ <strong>Beneficio:</strong> Mantiene al estudiante motivado y al día con sus asignaciones académicas.
    </div>
  </div>

  <div class="module-card">
    <div class="module-header">
      <div class="module-name">🤖 Módulo 12: Asistente Virtual Inteligente con IA (Chatbot 24/7)</div>
      <span class="module-badge">Atención Automatizada</span>
    </div>
    <div class="module-text">
      <strong>Función:</strong> Chatbot con inteligencia artificial entrenado con la información de INSTEIP. Responde dudas sobre temarios, costos y sedes las 24 horas del día.
    </div>
    <div class="module-benefit">
      ✨ <strong>Beneficio:</strong> Atiende a prospectos interesados durante las noches y fines de semana sin costo de personal.
    </div>
  </div>

  <div class="module-card">
    <div class="module-header">
      <div class="module-name">🛡️ Módulo 13: Auditoría Forense y Copias de Respaldo Automáticas</div>
      <span class="module-badge">Seguridad y Respaldo</span>
    </div>
    <div class="module-text">
      <strong>Función:</strong> Registra los movimientos del sistema y realiza copias de seguridad de la base de datos para asegurar que nunca se pierda información de notas o alumnos.
    </div>
    <div class="module-benefit">
      ✨ <strong>Beneficio:</strong> Tranquilidad absoluta para la Dirección General ante cualquier eventualidad técnica.
    </div>
  </div>

  <div class="module-card">
    <div class="module-header">
      <div class="module-name">⚙️ Módulo 14: Configuración Institucional y Personalización de Marca</div>
      <span class="module-badge">Identidad de Marca</span>
    </div>
    <div class="module-text">
      <strong>Función:</strong> Permite actualizar el logotipo, números de WhatsApp, sedes y datos institucionales sin necesidad de contratar programadores.
    </div>
    <div class="module-benefit">
      ✨ <strong>Beneficio:</strong> Independencia y control total en manos de la administración de INSTEIP.
    </div>
  </div>

  <!-- =====================================================================
       SECCIÓN 4: VISTA PREVIA VISUAL DEL SISTEMA
       ===================================================================== -->
  <div class="page-break"></div>
  <h2 class="section-title">4. Vista Previa Visual del Ecosistema INSTEIP</h2>
  <p>
    El sistema cuenta con una interfaz gráfica moderna, intuitiva y adaptada a la identidad visual de INSTEIP:
  </p>

  <table class="table-layout">
    <tr>
      <td style="width: 50%; padding-left: 0;">
        <div class="img-box">
          <img src="${imgDashboard}" alt="Dashboard Directivo">
          <div class="img-box-caption">Consola Central de Dirección General - Métricas y Usuarios</div>
        </div>
      </td>
      <td style="width: 50%; padding-right: 0;">
        <div class="img-box">
          <img src="${imgStudentPlayer}" alt="Reproductor de Clases">
          <div class="img-box-caption">Aula Virtual del Alumno - Reproductor de Clases en Video HD</div>
        </div>
      </td>
    </tr>
    <tr>
      <td style="width: 50%; padding-left: 0;">
        <div class="img-box">
          <img src="${imgCursos}" alt="Gestión de Cursos">
          <div class="img-box-caption">Gestor de Cursos, Módulos y Material Didáctico en PDF</div>
        </div>
      </td>
      <td style="width: 50%; padding-right: 0;">
        <div class="img-box">
          <img src="${imgValidacionQR}" alt="Validador de Certificados">
          <div class="img-box-caption">Sistema de Validación Antifraude QR de Certificados Oficiales</div>
        </div>
      </td>
    </tr>
  </table>

  <!-- =====================================================================
       SECCIÓN 5: PROPUESTA ECONÓMICA Y PLAN DE INVERSIÓN
       ===================================================================== -->
  <h2 class="section-title">5. Propuesta Económica y Plan de Inversión</h2>
  <p>
    Presentamos una estructura de inversión bajo la modalidad de <strong>Proyecto Integral "Llave en Mano"</strong>. La institución adquiere la <strong>propiedad absoluta del sistema</strong>, sin cobros por cantidad de alumnos ni comisiones sobre las matrículas.
  </p>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 8%;">Ítem</th>
        <th style="width: 54%;">Concepto / Módulos Incluidos</th>
        <th style="width: 18%; text-align: center;">Modalidad</th>
        <th style="width: 20%; text-align: right;">Inversión (S/)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>01</strong></td>
        <td>
          <strong>Portal Web Institucional & Catálogo Comercial Dinámico</strong><br>
          <span style="font-size: 7.8pt; color: #64748B;">Diseño adaptado a celulares y PC, fichas de cursos, temarios en PDF y botón a WhatsApp.</span>
        </td>
        <td style="text-align: center;"><span class="badge-status badge-blue">Implementado</span></td>
        <td style="text-align: right; font-weight: bold;">S/ 1,800.00</td>
      </tr>
      <tr>
        <td><strong>02</strong></td>
        <td>
          <strong>Campus Virtual 24/7 & Aula de Aprendizaje Multimedia</strong><br>
          <span style="font-size: 7.8pt; color: #64748B;">Módulos temáticos, reproductor con memoria de avance, subtítulos y descargas en PDF.</span>
        </td>
        <td style="text-align: center;"><span class="badge-status badge-blue">Implementado</span></td>
        <td style="text-align: right; font-weight: bold;">S/ 3,200.00</td>
      </tr>
      <tr>
        <td><strong>03</strong></td>
        <td>
          <strong>Módulo de Tareas, Evaluaciones y Calificaciones Docentes</strong><br>
          <span style="font-size: 7.8pt; color: #64748B;">Recepción de trabajos en PDF/Word, calificación vigesimal (0 a 20) y observaciones del profesor.</span>
        </td>
        <td style="text-align: center;"><span class="badge-status badge-blue">Implementado</span></td>
        <td style="text-align: right; font-weight: bold;">S/ 1,900.00</td>
      </tr>
      <tr>
        <td><strong>04</strong></td>
        <td>
          <strong>Sistema de Certificación Digital con Verificación QR Antifraude</strong><br>
          <span style="font-size: 7.8pt; color: #64748B;">Emisión de diplomas oficiales en PDF con código QR y pantalla de validación pública.</span>
        </td>
        <td style="text-align: center;"><span class="badge-status badge-blue">Implementado</span></td>
        <td style="text-align: right; font-weight: bold;">S/ 1,600.00</td>
      </tr>
      <tr>
        <td><strong>05</strong></td>
        <td>
          <strong>Consola de Administración, Comunicados y Pop-ups Promocionales</strong><br>
          <span style="font-size: 7.8pt; color: #64748B;">Dashboard directivo, matrículas masivas, avisos segmentados y flyers emergentes en la web.</span>
        </td>
        <td style="text-align: center;"><span class="badge-status badge-blue">Implementado</span></td>
        <td style="text-align: right; font-weight: bold;">S/ 2,100.00</td>
      </tr>
      <tr>
        <td><strong>06</strong></td>
        <td>
          <strong>Asistente Virtual con Inteligencia Artificial (Chatbot 24/7)</strong><br>
          <span style="font-size: 7.8pt; color: #64748B;">IA entrenada con cursos, sedes y reglamentos de INSTEIP para atención automática.</span>
        </td>
        <td style="text-align: center;"><span class="badge-status badge-blue">Implementado</span></td>
        <td style="text-align: right; font-weight: bold;">S/ 1,400.00</td>
      </tr>
      <tr>
        <td><strong>07</strong></td>
        <td>
          <strong>Infraestructura Cloud, Configuración de Servidor y Certificado SSL</strong><br>
          <span style="font-size: 7.8pt; color: #64748B;">Servidor VPS de alto rendimiento (6 núcleos, 12GB RAM, SSD), dominio https://insteip.com y backups.</span>
        </td>
        <td style="text-align: center;"><span class="badge-status badge-green">Incluido</span></td>
        <td style="text-align: right; font-weight: bold;">S/ 1,200.00</td>
      </tr>
      <tr>
        <td><strong>08</strong></td>
        <td>
          <strong>Capacitación al Personal, Carga de Cursos y Soporte Técnico</strong><br>
          <span style="font-size: 7.8pt; color: #64748B;">Entrenamiento a directivos y docentes, manuales de usuario y 3 meses de soporte gratuito.</span>
        </td>
        <td style="text-align: center;"><span class="badge-status badge-green">Garantía Total</span></td>
        <td style="text-align: right; font-weight: bold;">S/ 1,200.00</td>
      </tr>
      <tr class="total-row">
        <td colspan="3" style="text-align: right; text-transform: uppercase;">INVERSIÓN TOTAL DEL PROYECTO (LLAVE EN MANO):</td>
        <td style="text-align: right; font-size: 11pt; color: #0A3D2F;">S/ 14,400.00</td>
      </tr>
    </tbody>
  </table>

  <div class="card card-gold">
    <h3 style="color: #92400E; font-size: 9.5pt; margin-bottom: 4px;">🎁 Beneficio Especial para INSTEIP (Descuento Institucional):</h3>
    <p style="margin-bottom: 0; font-size: 8.8pt; color: #78350F;">
      Por convenio de implementación integral para todas las sedes (Lima, Huánuco, Piura y Campus Virtual), se otorga un <strong>Descuento Especial del 20%</strong>, quedando la inversión neta final en <strong>S/ 11,500.00</strong> (Once Mil Quinientos Soles) o su equivalente en dólares ($ 3,100.00 USD aprox.).
    </p>
  </div>

  <h3 class="sub-title">💳 Facilidades de Pago por Hitos de Entrega:</h3>
  <table class="table-layout">
    <tr>
      <td style="width: 33.33%; padding-left: 0;">
        <div class="card" style="border-top: 3px solid #0F5B46; margin-bottom: 0; padding: 10px;">
          <strong style="color: #0A3D2F; font-size: 8.8pt; display: block;">Hito 1: 40% (Adelanto)</strong>
          <span style="font-size: 8pt; color: #475569;">Al firmar la aceptación y entrega de accesos iniciales.</span>
        </div>
      </td>
      <td style="width: 33.33%;">
        <div class="card" style="border-top: 3px solid #0D9488; margin-bottom: 0; padding: 10px;">
          <strong style="color: #0D9488; font-size: 8.8pt; display: block;">Hito 2: 30% (Carga y Pruebas)</strong>
          <span style="font-size: 8pt; color: #475569;">Con la plataforma en la nube y cursos iniciales cargados.</span>
        </div>
      </td>
      <td style="width: 33.33%; padding-right: 0;">
        <div class="card" style="border-top: 3px solid #D97706; margin-bottom: 0; padding: 10px;">
          <strong style="color: #D97706; font-size: 8.8pt; display: block;">Hito 3: 30% (Conformidad)</strong>
          <span style="font-size: 8pt; color: #475569;">Tras culminar la capacitación y el lanzamiento oficial.</span>
        </div>
      </td>
    </tr>
  </table>

  <!-- =====================================================================
       SECCIÓN 6: RENTABILIDAD, GARANTÍA Y ACTA DE ACEPTACIÓN
       ===================================================================== -->
  <div class="page-break"></div>
  <h2 class="section-title">6. Comparativa de Rentabilidad y Retorno de Inversión</h2>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 30%;">Aspecto Evaluado</th>
        <th style="width: 35%;">Plataformas Externas (Hotmart / Teachable)</th>
        <th style="width: 35%;">Plataforma Propia INSTEIP (Propuesta)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Comisiones por Venta</strong></td>
        <td style="color: #991B1B;">Cobran entre 10% y 15% por cada alumno matriculado.</td>
        <td style="color: #15803D; font-weight: bold;">0% de comisión. 100% de la ganancia es para INSTEIP.</td>
      </tr>
      <tr>
        <td><strong>Propiedad de los Datos</strong></td>
        <td style="color: #991B1B;">Los datos de los alumnos pertenecen a la empresa externa.</td>
        <td style="color: #15803D; font-weight: bold;">Base de datos 100% privada y exclusiva de INSTEIP.</td>
      </tr>
      <tr>
        <td><strong>Marca e Identidad</strong></td>
        <td style="color: #991B1B;">Aparecen logotipos y banners de la plataforma proveedora.</td>
        <td style="color: #15803D; font-weight: bold;">Personalización total con la imagen de INSTEIP.</td>
      </tr>
      <tr>
        <td><strong>Certificados con QR Oficial</strong></td>
        <td style="color: #991B1B;">Plantillas genéricas sin validación institucional.</td>
        <td style="color: #15803D; font-weight: bold;">Certificados oficiales con validador web público por QR.</td>
      </tr>
    </tbody>
  </table>

  <div class="card card-highlight">
    <h3 style="color: #0A3D2F; font-size: 9.8pt; margin-bottom: 4px;">📈 Retorno de la Inversión (ROI Estimado):</h3>
    <p style="margin-bottom: 0; font-size: 8.8pt; color: #334155;">
      Con la matrícula de tan solo <strong>40 diplomados virtuales</strong> (a un promedio de S/ 280 por curso), la institución <strong>recupera el 100% de la inversión realizada</strong>. A partir de ese punto, todos los ingresos representan rentabilidad neta para INSTEIP.
    </p>
  </div>

  <h2 class="section-title" style="margin-top: 18px;">7. Garantía, Soporte y Compromiso de Calidad</h2>

  <div class="card">
    <ul class="role-bullet-list" style="margin-bottom: 0;">
      <li><strong>Garantía de Software por 12 Meses:</strong> Corrección inmediata sin costo de cualquier inconveniente técnico.</li>
      <li><strong>Soporte Técnico Directo:</strong> Asistencia continua vía WhatsApp y videollamada para el personal de INSTEIP.</li>
      <li><strong>Copias de Respaldo Periódicas:</strong> Protección permanente de la información de alumnos y notas académicas.</li>
      <li><strong>Propiedad Absoluta del Software:</strong> La plataforma y sus bases de datos son patrimonio 100% de INSTEIP.</li>
    </ul>
  </div>

  <h2 class="section-title" style="margin-top: 18px;">8. Acta de Conformidad y Aceptación</h2>
  <p>
    Estando conformes con el alcance funcional, módulos descritos y las condiciones económicas estipuladas, se procede a la firma de la presente propuesta:
  </p>

  <table class="firmas-table">
    <tr>
      <td>
        <div style="height: 45px;"></div>
        <div class="linea-firma">LIC. HÉCTOR TORRES</div>
        <div style="font-size: 8pt; color: #475569;">Director General / Representante Institucional</div>
        <div style="font-size: 8pt; color: #0F5B46; font-weight: bold;">INSTITUTO SUPERIOR INSTEIP</div>
        <div style="font-size: 7.2pt; color: #64748B; margin-top: 2px;">DNI: _______________________</div>
      </td>
      <td>
        <div style="height: 45px;"></div>
        <div class="linea-firma">ALESSANDRO ESTEBAN V.</div>
        <div style="font-size: 8pt; color: #475569;">Líder de Desarrollo & Arquitectura Tecnológica</div>
        <div style="font-size: 8pt; color: #0F5B46; font-weight: bold;">EQUIPO DE CONSULTORÍA TECNOLÓGICA</div>
        <div style="font-size: 7.2pt; color: #64748B; margin-top: 2px;">LIMA - PERÚ &bull; 2026</div>
      </td>
    </tr>
  </table>

  <div style="margin-top: 20px; text-align: center; font-size: 7.8pt; color: #64748B;">
    <em>"Transformando la educación en Terapias Integrales y Medicina Tradicional con tecnología de vanguardia."</em><br>
    <strong>INSTEIP &copy; 2026 &bull; Todos los Derechos Reservados &bull; Lima, Perú</strong>
  </div>

</body>
</html>
  `;

  console.log('-> Lanzando Chromium con Playwright para renderizar PDF en alta calidad con maquetación robusta...');
  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setContent(htmlContent, { waitUntil: 'load' });

  console.log('-> Generando archivo PDF: ' + outputPath);
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 7.5pt; width: 100%; display: flex; justify-content: space-between; padding: 0 15mm; color: #64748B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <span><strong>INSTEIP</strong> &bull; Propuesta Técnico-Económica</span>
        <span>Lic. Héctor Torres</span>
      </div>
    `,
    footerTemplate: `
      <div style="font-size: 7.5pt; width: 100%; display: flex; justify-content: space-between; padding: 0 15mm; color: #64748B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <span>Sistema Integral de Gestión Académica y Campus Virtual</span>
        <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: '15mm',
      bottom: '15mm',
      left: '15mm',
      right: '15mm'
    }
  });

  await browser.close();

  const stats = fs.statSync(outputPath);
  console.log(`================================================================`);
  console.log(`✅ ¡PDF GENERADO CON ÉXITO Y TOTALMENTE VISIBLE!`);
  console.log(`📁 Ubicación: ${outputPath}`);
  console.log(`📊 Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`================================================================`);
}

buildProposalPDF().catch(err => {
  console.error('Error generando el PDF:', err);
  process.exit(1);
});
