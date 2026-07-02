const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Ensure dummy test-material.pdf exists in root
const uploadFilePath = path.join(__dirname, 'test-material.pdf');
if (!fs.existsSync(uploadFilePath)) {
  console.log('   - Generando archivo test-material.pdf temporal para la prueba...');
  fs.writeFileSync(uploadFilePath, '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 43 >>\nstream\nBT /F1 12 Tf 70 700 Td (E2E Test Dummy PDF) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \n0000000212 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n306\n%%EOF');
}

async function runSuperTest() {
  console.log('================================================================');
  console.log('            INSTEIP - INICIANDO SUPER TEST AUTOMATIZADO          ');
  console.log('================================================================');
  
  // Launch Chrome locally using the user's installed Google Chrome channel
  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    slowMo: 600 // Slow motion so the user can easily follow the action visually
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[Browser Console Error]: ${msg.text()}`);
    }
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`[Browser Response Error]: ${response.status()} ${response.url()}`);
    }
  });

  try {
    let createdMaterialId;
    // ------------------------------------------------------------------
    // STEP 1: LOGIN AS ADMINISTRATOR
    // ------------------------------------------------------------------
    console.log('\n[1/12] Iniciando sesión como Administrador...');
    await page.goto('http://localhost:4200/login');
    await page.fill('input[type="email"]', 'admin@insteip.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');

    // Wait for dashboard load
    await page.waitForURL('**/dashboard');
    await page.waitForSelector('h1:has-text("Campus Virtual INSTEIP")');
    console.log('✔ Sesión de Administrador iniciada correctamente.');

    // ------------------------------------------------------------------
    // STEP 2: TEST HOME DASHBOARD & RAPID ACCESS BUTTONS
    // ------------------------------------------------------------------
    console.log('\n[2/12] Probando accesos rápidos del Panel de Control...');
    
    // Check main metrics cards are visible
    const metricAlumnos = await page.locator('span:has-text("Total Alumnos")').isVisible();
    const metricCursos = await page.locator('span:has-text("Total Cursos")').isVisible();
    const metricCertificados = await page.locator('span:has-text("Certificados Emitidos")').isVisible();
    console.log(`     Métricas visibles - Alumnos: ${metricAlumnos}, Cursos: ${metricCursos}, Certificados: ${metricCertificados}`);

    // Click "Cursos" rapid access link
    console.log('   - Click en Acceso Rápido: Cursos...');
    await page.click('a:has-text("Cursos"):visible');
    await page.waitForURL('**/dashboard/cursos');
    
    // Go back to Dashboard Home
    console.log('   - Regresando a Dashboard...');
    await page.click('a[routerLink="/dashboard"]:has-text("Dashboard"):visible');
    await page.waitForSelector('h1:has-text("Campus Virtual INSTEIP")');

    // Click "Alumnos" (Matricular) rapid access link
    console.log('   - Click en Acceso Rápido: Matricular...');
    await page.click('a:has-text("Matricular"):visible');
    await page.waitForURL('**/dashboard/alumnos');
    
    // Go back to Dashboard Home
    console.log('   - Regresando a Dashboard...');
    await page.click('a[routerLink="/dashboard"]:has-text("Dashboard"):visible');
    await page.waitForSelector('h1:has-text("Campus Virtual INSTEIP")');

    // Click "Auditoría" (Seguridad) rapid access link
    console.log('   - Click en Acceso Rápido: Seguridad...');
    await page.click('a:has-text("Seguridad"):visible');
    await page.waitForURL('**/dashboard/auditoria');
    
    // Go back to Dashboard Home
    console.log('   - Regresando a Dashboard...');
    await page.click('a[routerLink="/dashboard"]:has-text("Dashboard"):visible');
    await page.waitForSelector('h1:has-text("Campus Virtual INSTEIP")');

    // Click "Sistema" (Monitoreo) rapid access link
    console.log('   - Click en Acceso Rápido: Monitoreo...');
    await page.click('a:has-text("Monitoreo"):visible');
    await page.waitForURL('**/dashboard/sistema');
    
    console.log('✔ Accesos rápidos del panel general verificados.');

    // ------------------------------------------------------------------
    // STEP 3: TEST ALUMNOS VIEW AND BUTTONS (CRUD)
    // ------------------------------------------------------------------
    console.log('\n[3/12] Iniciando pruebas en Gestión de Alumnos...');
    await page.click('a[routerLink="/dashboard/alumnos"]:visible');
    await page.waitForURL('**/dashboard/alumnos');
    await page.waitForSelector('h1:has-text("Gestión de Alumnos")');

    // Test Export CSV
    console.log('   - Probando Exportar CSV de alumnos...');
    const [downloadAlumnos] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Exportar CSV")')
    ]);
    const csvAlumnosPath = await downloadAlumnos.path();
    console.log(`     ✔ CSV Alumnos descargado correctamente en: ${csvAlumnosPath}`);

    // Click "Crear Alumno"
    console.log('   - Abriendo modal para crear alumno...');
    await page.click('button:has-text("Crear Alumno")');
    await page.waitForSelector('h3:has-text("Registrar Nuevo Alumno")');

    // Fill new student details
    const dummyEmail = `test.e2e.${Date.now()}@insteip.com`;
    console.log(`   - Creando alumno de prueba con correo: ${dummyEmail}`);
    await page.fill('input[formControlName="nombres"]', 'Alumno');
    await page.fill('input[formControlName="apellidos"]', 'E2E Test');
    await page.fill('input[formControlName="correo"]', dummyEmail);
    await page.fill('input[formControlName="telefono"]', '987654321');
    await page.selectOption('select[formControlName="nivelSuscripcionId"]', '3'); // PREMIUM
    await page.click('button[type="submit"]');

    // Search for the newly created student
    console.log('   - Buscando al alumno creado en la tabla...');
    await page.fill('input[placeholder="Buscar por nombre o correo..."]', dummyEmail);
    await page.waitForTimeout(1000); // Wait for frontend filter

    // Open detail modal
    console.log('   - Abriendo ficha detallada del alumno...');
    await page.click('button[title="Ver Detalle"]:visible');
    await page.waitForSelector('h3:has-text("Ficha Detallada del Alumno")');
    await page.click('button:has-text("Cerrar Ficha")');

    // Open edit modal
    console.log('   - Editando datos del alumno...');
    await page.click('button[title="Editar Alumno"]:visible');
    await page.waitForSelector('h3:has-text("Editar Datos del Alumno")');
    await page.fill('input[formControlName="apellidos"]', 'E2E Test Modificado');
    await page.click('button[type="submit"]');
    console.log('     ✔ Datos del alumno actualizados.');

    // Toggle status (Deactivate / Activate)
    console.log('   - Probando alternar estado (Activo/Inactivo)...');
    await page.click('button[title="Desactivar"]:visible');
    await page.waitForTimeout(1000);
    await page.click('button[title="Activar"]:visible');
    await page.waitForTimeout(1000);
    console.log('     ✔ Alternador de estado verificado.');

    // Clear search input
    await page.fill('input[placeholder="Buscar por nombre o correo..."]', '');
    await page.waitForTimeout(500);
    console.log('✔ Pruebas en Gestión de Alumnos completadas.');

    // ------------------------------------------------------------------
    // STEP 4: TEST CURSOS VIEW AND BUTTONS
    // ------------------------------------------------------------------
    console.log('\n[4/12] Iniciando pruebas en Gestión de Cursos...');
    await page.click('a[routerLink="/dashboard/cursos"]:visible');
    await page.waitForURL('**/dashboard/cursos');
    await page.waitForSelector('h1:has-text("Gestión de Cursos")');

    // Test Export CSV
    console.log('   - Probando Exportar CSV de cursos...');
    const [downloadCursos] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Exportar CSV")')
    ]);
    const csvCursosPath = await downloadCursos.path();
    console.log(`     ✔ CSV Cursos descargado correctamente en: ${csvCursosPath}`);

    // Create course
    console.log('   - Creando nuevo curso...');
    await page.click('button:has-text("Crear Curso")');
    await page.waitForSelector('h3:has-text("Registrar Nuevo Curso")');

    const testCourseName = `Curso E2E Automatizado ${Date.now()}`;
    await page.fill('input[formControlName="nombre"]', testCourseName);
    await page.fill('textarea[formControlName="descripcion"]', 'Curso creado por Playwright para probar todos los botones y endpoints.');
    await page.fill('input[formControlName="imagenPortada"]', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3');
    
    // Choose Subscription Levels
    await page.click('button:has-text("Intermedio")');
    await page.click('button:has-text("Premium")');
    await page.click('button[type="submit"]');

    // Search and navigate to details
    console.log('   - Buscando curso creado para configurar temario...');
    await page.fill('input[placeholder="Buscar por nombre o descripción..."]', testCourseName);
    await page.waitForTimeout(1000);
    await page.click('button[title="Administrar Temario y Alumnos"]:visible');

    await page.waitForURL('**/dashboard/cursos/**');
    console.log(`✔ Redirigido a la ficha técnica de: ${testCourseName}`);

    // ------------------------------------------------------------------
    // STEP 5: SYLLABUS, VIDEOS, MATERIALS & MATRICULATION
    // ------------------------------------------------------------------
    console.log('\n[5/12] Probando temario, videos, materiales y matrículas...');
    
    // Edit course details from within details page
    console.log('   - Probando botón: Editar Curso...');
    await page.click('button:has-text("Editar Curso")');
    await page.waitForSelector('h3:has-text("Modificar Curso")');
    await page.fill('textarea[formControlName="descripcion"]', 'Curso de Playwright con temario y alumnos configurados.');
    await page.click('button:has-text("Guardar Cambios")');
    console.log('     ✔ Modificación de curso guardada.');

    // Add module
    console.log('   - Probando botón: Agregar Módulo...');
    await page.click('button:has-text("Agregar Módulo")');
    await page.waitForSelector('h3:has-text("Registrar Nuevo Módulo")');
    await page.fill('input[formControlName="nombre"]', 'Módulo Principal E2E');
    await page.fill('textarea[formControlName="descripcion"]', 'Contenido estructurado del programa.');
    await page.fill('input[formControlName="orden"]', '1');
    await page.click('button:has-text("Guardar Módulo")');
    console.log('     ✔ Módulo guardado.');

    // Expand accordion
    console.log('   - Expandiendo acordeón del módulo...');
    await page.click('h3:has-text("Módulo Principal E2E")');
    await page.waitForSelector('h4:has-text("Videos de Clases")');

    // Add Video Inline
    console.log('   - Probando botón: Agregar Video...');
    await page.click('button:has-text("Agregar Video")');
    await page.fill('input[placeholder="Ej. Introducción Práctica"]', 'Clase Grabada Playwright');
    await page.fill('input[placeholder="Ej. https://youtube.com/watch?v=..."]', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await page.fill('textarea[placeholder="Contenido clave de la lección..."]', 'Sesión teórica y práctica guiada.');
    await page.click('button:has-text("Guardar Video")');
    await page.waitForSelector('h5:has-text("Clase Grabada Playwright")');
    console.log('     ✔ Video de clase guardado.');

    // Toggle video status
    console.log('   - Alternando estado del video...');
    await page.click('button[title="Desactivar"]:visible');
    await page.waitForTimeout(500);
    await page.click('button[title="Activar"]:visible');
    await page.waitForTimeout(500);

    // Upload Material Inline
    console.log('   - Probando botón: Subir Archivo...');
    await page.click('button:has-text("Subir Archivo")');
    await page.fill('input[placeholder="Ej. Guía Práctica Excel"]', 'Guía de Pruebas Automatizadas');

    const uploadFilePath = path.join(__dirname, 'test-material.pdf');
    if (fs.existsSync(uploadFilePath)) {
      const fileInput = await page.locator('input[type="file"]');
      await fileInput.setInputFiles(uploadFilePath);
    } else {
      throw new Error('Archivo test-material.pdf no existe.');
    }
    const [responseMaterial] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/materiales') && res.status() === 201),
      page.click('button:has-text("Subir Archivo")')
    ]);
    const responseJsonMaterial = await responseMaterial.json();
    createdMaterialId = responseJsonMaterial.id;
    await page.waitForSelector('h5:has-text("Guía de Pruebas Automatizadas")');
    console.log(`     ✔ Material de apoyo (PDF) cargado con ID: ${createdMaterialId}`);

    // Toggle material status
    console.log('   - Alternando estado del material...');
    await page.click('button[title="Desactivar"]:visible');
    await page.waitForTimeout(500);
    await page.click('button[title="Activar"]:visible');
    await page.waitForTimeout(500);

    // Edit Modulo Inline
    console.log('   - Editando datos del módulo...');
    await page.locator('button:has(span:text-is("Editar"))').click();
    await page.waitForSelector('h3:has-text("Editar Módulo")');
    await page.fill('textarea[formControlName="descripcion"]', 'Temario editado por el super-test.');
    await page.click('button:has-text("Guardar Módulo")');
    console.log('     ✔ Modificación de módulo guardada.');

    // Toggle module status
    console.log('   - Alternando estado del módulo...');
    await page.locator('button:has(span:text-is("Desactivar"))').click();
    await page.waitForTimeout(500);
    await page.locator('button:has(span:text-is("Activar"))').click();
    await page.waitForTimeout(500);

    // Matriculate Juan Pérez
    console.log('   - Navegando a pestaña de Alumnos Matriculados...');
    await page.click('button:has-text("Alumnos Matriculados")');
    await page.click('button:has-text("Matricular Alumno")');
    await page.waitForSelector('h3:has-text("Matricular Alumno")');
    
    // Robustly select Juan Pérez from select option
    const select = page.locator('select');
    await select.click();
    const juanPerezValue = await select.locator('option:has-text("juan.perez@insteip.com")').getAttribute('value');
    await select.selectOption(juanPerezValue);
    await page.locator('.fixed button:has-text("Matricular")').click();

    // Verify matriculated student is visible
    await page.waitForSelector('span:has-text("Juan Pérez")');
    console.log('     ✔ Alumno Juan Pérez matriculado.');

    // Toggle matricula status (Deactivate / Activate)
    console.log('   - Probando botón: Dar de Baja / Reactivar matrícula...');
    await page.click('button[title="Dar de Baja"]:visible');
    await page.waitForTimeout(500);
    await page.click('button[title="Reactivar"]:visible');
    await page.waitForTimeout(500);

    // Export matriculas CSV
    console.log('   - Probando Exportar CSV de matriculados...');
    const [downloadMatriculas] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Exportar CSV")')
    ]);
    const csvMatriculasPath = await downloadMatriculas.path();
    console.log(`     ✔ CSV Matriculados descargado correctamente en: ${csvMatriculasPath}`);

    console.log('✔ Temario, videos, materiales y matrículas de curso completados.');

    // ------------------------------------------------------------------
    // STEP 6: TEST REPORTES & CERTIFICADOS VIEW (ADMIN)
    // ------------------------------------------------------------------
    console.log('\n[6/12] Probando Reportes de Certificados (Admin)...');
    await page.click('a[routerLink="/dashboard/certificados"]:visible');
    await page.waitForURL('**/dashboard/certificados');
    await page.waitForSelector('h1:has-text("Reporte de Certificados")');

    const [downloadCertificados] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Exportar CSV")')
    ]);
    const csvCertificadosPath = await downloadCertificados.path();
    console.log(`     ✔ CSV Certificados descargado en: ${csvCertificadosPath}`);
    console.log('✔ Reporte de Certificados verificado.');

    // ------------------------------------------------------------------
    // STEP 7: TEST CONFIGURACIÓN (ADMIN)
    // ------------------------------------------------------------------
    console.log('\n[7/12] Probando Configuración Institucional...');
    await page.click('a[routerLink="/dashboard/configuracion"]:visible');
    await page.waitForURL('**/dashboard/configuracion');
    await page.waitForSelector('h1:has-text("Configuración Institucional")');

    // Click tabs
    console.log('   - Cambiando a pestaña: Medios de Pago...');
    await page.click('button:has-text("Medios de Pago")');
    await page.waitForSelector('h4:has-text("QR Yape")');

    console.log('   - Cambiando a pestaña: Branding...');
    await page.click('button:has-text("Branding")');
    await page.waitForSelector('label:has-text("Color Principal")');

    console.log('   - Cambiando a pestaña: Información General...');
    await page.click('button:has-text("Información General")');
    await page.waitForSelector('h3:has-text("Datos del Instituto")');

    // Save configuration
    await page.fill('input[formControlName="telefono"]', '999999999');
    await page.click('button:has-text("Guardar Cambios")');
    await page.waitForSelector('div:has-text("Configuración guardada exitosamente.")');
    console.log('✔ Pestañas y Guardado de Configuración verificados.');

    // ------------------------------------------------------------------
    // STEP 8: TEST AUDITORÍA & SISTEMA DASHBOARDS
    // ------------------------------------------------------------------
    console.log('\n[8/12] Probando Auditoría de Seguridad y Monitoreo del Sistema...');
    
    // Auditoria
    await page.click('a[routerLink="/dashboard/auditoria"]:visible');
    await page.waitForURL('**/dashboard/auditoria');
    await page.waitForSelector('h1:has-text("Auditoría de Seguridad")');

    console.log('   - Cambiando a pestaña: Sistema (Bitácora)...');
    await page.click('button:has-text("Sistema")');
    await page.waitForSelector('th:has-text("Módulo")');

    console.log('   - Cambiando a pestaña: Login...');
    await page.click('button:has-text("Login")');
    await page.waitForSelector('th:has-text("IP")');

    // Sistema
    await page.click('a[routerLink="/dashboard/sistema"]:visible');
    await page.waitForURL('**/dashboard/sistema');
    await page.waitForSelector('h1:has-text("Monitoreo del Sistema")');

    console.log('   - Actualizando estado del sistema...');
    await page.click('button:has-text("Actualizar Estado")');
    await page.waitForTimeout(1000);

    console.log('   - Disparando copia de seguridad manual (Backup)...');
    await page.click('button:has-text("Backup Ahora")');
    await page.waitForSelector('div:has-text("Copia de Seguridad Completada")');
    console.log('✔ Auditoría y Monitoreo del Sistema verificados al 100%.');

    // ------------------------------------------------------------------
    // STEP 9: LOGOUT ADMIN
    // ------------------------------------------------------------------
    console.log('\n[9/12] Finalizando sesión del Administrador...');
    await page.click('button:has-text("Cerrar Sesión"):visible');
    await page.waitForURL('**/login');
    console.log('✔ Cierre de sesión completo.');

    // ------------------------------------------------------------------
    // STEP 10: LOGIN AS STUDENT (JUAN PÉREZ)
    // ------------------------------------------------------------------
    console.log('\n[10/12] Iniciando sesión como Estudiante (Juan Pérez)...');
    await page.fill('input[type="email"]', 'juan.perez@insteip.com');
    await page.fill('input[type="password"]', 'Alumno123!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');
    await page.waitForSelector('h1:has-text("¡Hola de nuevo, Juan!")');
    console.log('✔ Sesión de Estudiante iniciada.');

    // Verify student KPIs
    const metricCursosInscritos = await page.locator('span:has-text("Cursos Inscritos")').isVisible();
    const metricCursosCompletados = await page.locator('span:has-text("Cursos Completados")').isVisible();
    const metricCertificadosLogrados = await page.locator('span:has-text("Certificados Logrados")').isVisible();
    console.log(`     Métricas Alumno - Inscritos: ${metricCursosInscritos}, Completados: ${metricCursosCompletados}, Logrados: ${metricCertificadosLogrados}`);

    // ------------------------------------------------------------------
    // STEP 11: TEST PLAYBACK, MATERIAL DOWNLOAD & CERTIFICATE GENERATION
    // ------------------------------------------------------------------
    console.log('\n[11/12] Probando reproductor, descargas y diplomas del estudiante...');
    
    // Visit "Mis Cursos"
    await page.click('a[routerLink="/dashboard/mis-cursos"]:visible');
    await page.waitForURL('**/dashboard/mis-cursos');
    await page.waitForSelector('h1:has-text("Mis Cursos")');

    // Find the card for this course and click its play/start button
    console.log('   - Accediendo al curso matriculado...');
    const courseCard = page.locator('div.border', { hasText: testCourseName });
    await courseCard.locator('button').click();
    await page.waitForURL('**/dashboard/cursos-play/**');
    await page.waitForSelector('h1:has-text("' + testCourseName + '")');

    // Click on the module accordion in playlist
    console.log('   - Seleccionando módulo del temario...');
    await page.click('span:has-text("Módulo 1: Módulo Principal E2E")');

    // Click video to play
    console.log('   - Seleccionando clase en el listado para reproducir...');
    await page.click('span:has-text("Clase Grabada Playwright")');

    // View Tabs
    console.log('   - Leyendo pestaña: Información del Curso...');
    await page.click('button:has-text("Información del Curso")');
    await page.waitForSelector('h3:has-text("Sobre este curso")');

    console.log('   - Leyendo pestaña: Materiales de Apoyo...');
    await page.click('button:has-text("Materiales de Apoyo")');
    await page.waitForSelector('h4:has-text("Guía de Pruebas Automatizadas")');

    // Download study material as student
    console.log('   - Descargando material académico...');
    const [downloadMaterialStudent] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('div.group', { hasText: 'Guía de Pruebas Automatizadas' }).locator('button').click()
    ]);
    const fileMaterialPath = await downloadMaterialStudent.path();
    console.log(`     ✔ Material de apoyo descargado por Alumno en: ${fileMaterialPath}`);

    // Verify HTTP 403 Forbidden on unauthorized downloads
    console.log('   - Verificando restricción de descarga no autorizada (HTTP 403)...');
    const token = await page.evaluate(() => localStorage.getItem('token') || sessionStorage.getItem('token'));
    const unauthorizedResponse = await page.request.get('http://localhost:8081/api/materiales/3/download', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(`     Código retornado: ${unauthorizedResponse.status()}`);
    if (unauthorizedResponse.status() !== 403) {
      throw new Error(`Esperado HTTP 403 al descargar recurso no autorizado, pero se obtuvo: ${unauthorizedResponse.status()}`);
    }
    console.log('     ✔ Correctamente denegado con código 403 Forbidden.');

    // Check certificate locked state
    console.log('   - Leyendo pestaña: Certificado Oficial (Estado bloqueado)...');
    await page.click('button:has-text("Certificado Oficial")');
    await page.waitForSelector('h3:has-text("Certificado Bloqueado")');

    // Mark video as completed to unlock certificate
    console.log('   - Completando la clase para desbloquear el diploma...');
    await page.click('button:has-text("Marcar como completado")');
    await page.waitForTimeout(1000);

    // Verify unlocked state in Certificado tab
    console.log('   - Leyendo pestaña: Certificado Oficial (Estado desbloqueado)...');
    await page.waitForSelector('h3:has-text("Tu Certificado está Listo")');
    await page.waitForSelector('strong:has-text("INS-")');

    // Click Download Certificate PDF
    console.log('   - Descargando diploma oficial...');
    const [downloadDiploma] = await Promise.all([
      context.waitForEvent('download'),
      page.click('button:has-text("Descargar PDF"):visible')
    ]);
    const fileDiplomaPath = await downloadDiploma.path();
    console.log(`     ✔ Diploma PDF descargado correctamente en: ${fileDiplomaPath}`);

    // Retrieve Certificate Validation Code
    const certCodeElement = await page.locator('strong:has-text("INS-")').textContent();
    const cleanCertCode = certCodeElement.trim();
    console.log(`     Código de Certificado generado: ${cleanCertCode}`);

    // Visit "Mis Certificados" student view
    console.log('   - Navegando a Mis Certificados del Estudiante...');
    await page.click('a[routerLink="/dashboard/certificados"]:visible');
    await page.waitForURL('**/dashboard/certificados');
    await page.waitForSelector('h1:has-text("Mis Certificados")');
    await page.waitForSelector(`td:has-text("${cleanCertCode}")`);
    console.log('     ✔ Diploma validado e insertado en el historial de certificados del alumno.');

    // Click PDF download link in historical table
    console.log('   - Probando descargar PDF desde historial...');
    const [downloadHistorial] = await Promise.all([
      context.waitForEvent('download'),
      page.click('button[title="Descargar Certificado PDF"]:visible')
    ]);
    const fileHistorialPath = await downloadHistorial.path();
    console.log(`     ✔ PDF descargado desde historial en: ${fileHistorialPath}`);

    // Click Validar link in historical table
    console.log('   - Probando validar firma desde historial (abre nueva pestaña)...');
    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.click('a[title="Validar Certificado"]:visible')
    ]);
    await popup.waitForLoadState();
    await popup.waitForSelector('span:has-text("CERTIFICADO VÁLIDO")');
    console.log('     ✔ Firma del diploma verificada en la nueva pestaña.');
    await popup.close();

    // Visit "Mi Perfil" student view
    console.log('   - Navegando a Mi Perfil...');
    await page.click('a[routerLink="/dashboard/perfil"]:visible');
    await page.waitForURL('**/dashboard/perfil');
    await page.waitForSelector('h2:has-text("Tus Logros Académicos")');
    
    // Verify subscription level details
    const activePremiumPlan = await page.locator('h3:has-text("PREMIUM")').isVisible();
    console.log(`     Plan Premium Activo en Ficha de Alumno: ${activePremiumPlan}`);

    // ------------------------------------------------------------------
    // STEP 12: PUBLIC VALIDATION ENDPOINT TESTING
    // ------------------------------------------------------------------
    console.log('\n[12/12] Probando endpoint de validación pública de firmas...');
    
    // Logout student
    await page.click('button:has-text("Cerrar Sesión"):visible');
    await page.waitForURL('**/login');

    // Go to public validation URL
    const publicValidationUrl = `http://localhost:4200/certificados/validar/${cleanCertCode}`;
    console.log(`   - Visitando pasarela pública: ${publicValidationUrl}`);
    await page.goto(publicValidationUrl);

    // Wait for certificate details card
    await page.waitForSelector('span:has-text("CERTIFICADO VÁLIDO")');
    await page.waitForSelector(`div:has-text("${cleanCertCode}")`);

    // Verify specific certificate details on public gateway
    console.log('   - Comprobando que los datos expuestos en la validación sean correctos...');
    const studentNameVisible = await page.locator('div.col-span-2:has-text("Juan Pérez")').isVisible();
    const courseNameVisible = await page.locator(`div.col-span-2:has-text("${testCourseName}")`).isVisible();
    console.log(`     Datos de validación visibles - Alumno: ${studentNameVisible}, Curso: ${courseNameVisible}`);
    if (!studentNameVisible || !courseNameVisible) {
      throw new Error('Fallo al validar los datos del estudiante o del curso en la pasarela pública de firmas.');
    }

    console.log('   ✔ Pasarela pública del campus INSTEIP respondió y validó la firma del diploma.');

    console.log('\n================================================================');
    console.log('       ★ SUPER TEST COMPLETADO CON ÉXITO: 100% FUNCIONAL ★      ');
    console.log('================================================================');
  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA EJECUCIÓN DEL TEST:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runSuperTest();
