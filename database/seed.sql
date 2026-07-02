-- Datos iniciales y de prueba para INSTEIP (Versión Mejorada)
-- Motor: PostgreSQL

-- =========================================================================
-- 1. SEED: roles
-- =========================================================================
INSERT INTO roles (nombre) VALUES
('ADMINISTRADOR'),
('ALUMNO')
ON CONFLICT (nombre) DO NOTHING;

-- =========================================================================
-- 2. SEED: niveles_suscripcion
-- =========================================================================
INSERT INTO niveles_suscripcion (nombre, descripcion) VALUES
('BASICO', 'Acceso a cursos introductorios y material de lectura básico.'),
('INTERMEDIO', 'Acceso a cursos especializados, talleres prácticos y soporte moderado.'),
('PREMIUM', 'Acceso completo e ilimitado a todos los cursos, tutorías personalizadas y certificados oficiales.')
ON CONFLICT (nombre) DO NOTHING;

-- =========================================================================
-- 3. SEED: usuarios
-- =========================================================================
INSERT INTO usuarios (rol_id, nivel_suscripcion_id, nombres, apellidos, correo, password_hash, telefono) VALUES
(
  (SELECT id FROM roles WHERE nombre = 'ADMINISTRADOR'),
  NULL,
  'Admin',
  'Insteip',
  'admin@insteip.com',
  '$2a$12$R9h/lIPzMRF.8npxi.fH2Oq7D6k5k1v.6XfT5Zp.0eD17t.i46mye', -- contraseña ej: Admin123!
  '+51 987654321'
),
(
  (SELECT id FROM roles WHERE nombre = 'ALUMNO'),
  (SELECT id FROM niveles_suscripcion WHERE nombre = 'BASICO'),
  'Juan Carlos',
  'Pérez Gómez',
  'juan.perez@insteip.com',
  '$2a$12$R9h/lIPzMRF.8npxi.fH2Oq7D6k5k1v.6XfT5Zp.0eD17t.i46mye', -- contraseña ej: Alumno123!
  '+51 912345678'
),
(
  (SELECT id FROM roles WHERE nombre = 'ALUMNO'),
  (SELECT id FROM niveles_suscripcion WHERE nombre = 'PREMIUM'),
  'María Fernanda',
  'Rodríguez Ruiz',
  'maria.rodriguez@insteip.com',
  '$2a$12$R9h/lIPzMRF.8npxi.fH2Oq7D6k5k1v.6XfT5Zp.0eD17t.i46mye', -- contraseña ej: Alumno123!
  '+51 955555555'
)
ON CONFLICT (correo) DO NOTHING;

-- =========================================================================
-- 4. SEED: pagos (NUEVO: Control Manual de Transacciones)
-- =========================================================================
-- Pago 1: Pendiente de aprobación (Juan Pérez solicita Intermedio)
INSERT INTO pagos (usuario_id, nivel_suscripcion_id, monto, metodo_pago, numero_operacion, observaciones, aprobado, fecha_pago) VALUES
(
  (SELECT id FROM usuarios WHERE correo = 'juan.perez@insteip.com'),
  (SELECT id FROM niveles_suscripcion WHERE nombre = 'INTERMEDIO'),
  49.90,
  'YAPE',
  'OPER-99887766',
  'Transferencia realizada el lunes por la tarde. Adjunta captura.',
  FALSE,
  CURRENT_TIMESTAMP - INTERVAL '1 day'
);

-- Pago 2: Aprobado por el Administrador (María Rodríguez compró Premium)
INSERT INTO pagos (usuario_id, nivel_suscripcion_id, monto, metodo_pago, numero_operacion, observaciones, aprobado, fecha_pago, fecha_aprobacion, aprobado_por) VALUES
(
  (SELECT id FROM usuarios WHERE correo = 'maria.rodriguez@insteip.com'),
  (SELECT id FROM niveles_suscripcion WHERE nombre = 'PREMIUM'),
  149.00,
  'PAYPAL',
  'PAYID-MN67890X',
  'Pago internacional verificado por PayPal.',
  TRUE,
  CURRENT_TIMESTAMP - INTERVAL '5 days',
  CURRENT_TIMESTAMP - INTERVAL '4 days',
  (SELECT id FROM usuarios WHERE correo = 'admin@insteip.com')
);

-- =========================================================================
-- 5. SEED: login_auditoria (NUEVO)
-- =========================================================================
INSERT INTO login_auditoria (usuario_id, correo, ip, user_agent, exitoso, motivo) VALUES
(
  (SELECT id FROM usuarios WHERE correo = 'juan.perez@insteip.com'),
  'juan.perez@insteip.com',
  '192.168.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0',
  TRUE,
  NULL
),
(
  (SELECT id FROM usuarios WHERE correo = 'maria.rodriguez@insteip.com'),
  'maria.rodriguez@insteip.com',
  '200.48.56.9',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
  TRUE,
  NULL
),
(
  NULL,
  'usuario.inexistente@insteip.com',
  '192.168.1.50',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/126.0',
  FALSE,
  'Credenciales inválidas'
);

-- =========================================================================
-- 6. SEED: cursos
-- =========================================================================
INSERT INTO cursos (nombre, descripcion, imagen_portada) VALUES
(
  'Desarrollo Web Moderno con Angular',
  'Aprende a construir aplicaciones SPA escalables, rápidas y profesionales usando Angular 17+, TypeScript, RxJS y standalone components.',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'
),
(
  'Backend Robusto con Spring Boot y JPA',
  'Domina la creación de REST APIs empresariales usando Spring Boot, Spring Security (JWT), PostgreSQL y Spring Data JPA de forma práctica.',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c'
),
(
  'Arquitectura de Microservicios y DevOps Cloud',
  'Aprende a diseñar, desplegar y escalar microservicios en la nube usando Spring Cloud, Docker, Kubernetes, AWS y pipelines CI/CD con GitHub Actions.',
  'https://images.unsplash.com/photo-1607799279861-4dd421887fb3'
);

INSERT INTO curso_niveles_suscripcion (curso_id, nivel_suscripcion_id) VALUES
(
  (SELECT id FROM cursos WHERE nombre = 'Desarrollo Web Moderno con Angular'),
  (SELECT id FROM niveles_suscripcion WHERE nombre = 'BASICO')
),
(
  (SELECT id FROM cursos WHERE nombre = 'Backend Robusto con Spring Boot y JPA'),
  (SELECT id FROM niveles_suscripcion WHERE nombre = 'INTERMEDIO')
),
(
  (SELECT id FROM cursos WHERE nombre = 'Arquitectura de Microservicios y DevOps Cloud'),
  (SELECT id FROM niveles_suscripcion WHERE nombre = 'PREMIUM')
);

-- =========================================================================
-- 7. SEED: modulos
-- =========================================================================
INSERT INTO modulos (curso_id, nombre, descripcion, orden) VALUES
(
  (SELECT id FROM cursos WHERE nombre = 'Desarrollo Web Moderno con Angular'),
  'Módulo 1: Fundamentos de Angular',
  'Configuración del entorno, creación de proyectos con Angular CLI y arquitectura de la plataforma.',
  1
),
(
  (SELECT id FROM cursos WHERE nombre = 'Desarrollo Web Moderno con Angular'),
  'Módulo 2: Componentes y Directivas',
  'Ciclo de vida de un componente, enlaces de datos (binding), directivas estructurales y de atributos.',
  2
),
(
  (SELECT id FROM cursos WHERE nombre = 'Backend Robusto con Spring Boot y JPA'),
  'Módulo 1: Iniciando con Spring Boot',
  'Configuración con Spring Initializr, estructura del proyecto y controladores REST básicos.',
  1
);

-- =========================================================================
-- 8. SEED: videos
-- =========================================================================
INSERT INTO videos (modulo_id, titulo, descripcion, youtube_url, youtube_id, duracion_segundos, orden) VALUES
(
  (SELECT id FROM modulos WHERE nombre = 'Módulo 1: Fundamentos de Angular'),
  '1.1. Introducción e Instalación del Entorno',
  'Aprenderemos a instalar Node.js, Angular CLI y a crear nuestro primer workspace.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  720,
  1
),
(
  (SELECT id FROM modulos WHERE nombre = 'Módulo 1: Fundamentos de Angular'),
  '1.2. Arquitectura de un Proyecto Angular',
  'Estructura de archivos, modulos, componentes y la inyección de dependencias explicada.',
  'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
  '3JZ_D3ELwOQ',
  900,
  2
),
(
  (SELECT id FROM modulos WHERE nombre = 'Módulo 2: Componentes y Directivas'),
  '2.1. Creando nuestro primer Componente',
  'Cómo definir plantillas, estilos y lógica en un componente de Angular.',
  'https://www.youtube.com/watch?v=k5E2AV3-O90',
  'k5E2AV3-O90',
  1050,
  1
),
(
  (SELECT id FROM modulos WHERE nombre = 'Módulo 1: Iniciando con Spring Boot'),
  '1.1. Hola Mundo con Spring Initializr',
  'Generación de dependencias iniciales, configuración de pom.xml y ejecución del primer REST Controller.',
  'https://www.youtube.com/watch?v=9SGDpanrc8U',
  '9SGDpanrc8U',
  800,
  1
);

-- =========================================================================
-- 9. SEED: materiales (Mejorado: Asociados a Módulos)
-- =========================================================================
INSERT INTO materiales (modulo_id, nombre, archivo_url, tipo_archivo, peso_bytes) VALUES
(
  (SELECT id FROM modulos WHERE nombre = 'Módulo 1: Fundamentos de Angular'),
  'Guía de Instalación del Entorno (PDF)',
  'https://assets.insteip.com/materiales/guia-instalacion.pdf',
  'application/pdf',
  2548000 -- ~2.4 MB
),
(
  (SELECT id FROM modulos WHERE nombre = 'Módulo 1: Fundamentos de Angular'),
  'Ejercicios Resueltos - Sesión 1',
  'https://assets.insteip.com/materiales/ejercicios-s1.zip',
  'application/zip',
  1450000 -- ~1.38 MB
),
(
  (SELECT id FROM modulos WHERE nombre = 'Módulo 1: Iniciando con Spring Boot'),
  'Código Fuente del Hola Mundo (GitHub)',
  'https://github.com/insteip-cursos/spring-boot-hello-world',
  'url',
  NULL
);

-- =========================================================================
-- 10. SEED: matriculas
-- =========================================================================
INSERT INTO matriculas (usuario_id, curso_id) VALUES
(
  (SELECT id FROM usuarios WHERE correo = 'juan.perez@insteip.com'),
  (SELECT id FROM cursos WHERE nombre = 'Desarrollo Web Moderno con Angular')
),
(
  (SELECT id FROM usuarios WHERE correo = 'maria.rodriguez@insteip.com'),
  (SELECT id FROM cursos WHERE nombre = 'Desarrollo Web Moderno con Angular')
),
(
  (SELECT id FROM usuarios WHERE correo = 'maria.rodriguez@insteip.com'),
  (SELECT id FROM cursos WHERE nombre = 'Backend Robusto con Spring Boot y JPA')
);

-- =========================================================================
-- 11. SEED: avance_videos
-- =========================================================================
INSERT INTO avance_videos (usuario_id, video_id, ultimo_segundo, porcentaje_visto, completado) VALUES
(
  (SELECT id FROM usuarios WHERE correo = 'juan.perez@insteip.com'),
  (SELECT id FROM videos WHERE titulo = '1.1. Introducción e Instalación del Entorno'),
  720,
  100.00,
  TRUE
),
(
  (SELECT id FROM usuarios WHERE correo = 'juan.perez@insteip.com'),
  (SELECT id FROM videos WHERE titulo = '1.2. Arquitectura de un Proyecto Angular'),
  450,
  50.00,
  FALSE
);

-- =========================================================================
-- 12. SEED: avance_cursos
-- =========================================================================
INSERT INTO avance_cursos (usuario_id, curso_id, porcentaje_avance, completado) VALUES
(
  (SELECT id FROM usuarios WHERE correo = 'juan.perez@insteip.com'),
  (SELECT id FROM cursos WHERE nombre = 'Desarrollo Web Moderno con Angular'),
  50.00,
  FALSE
);

-- =========================================================================
-- 13. SEED: certificados (Mejorado con URL de validación y Nro Registro)
-- =========================================================================
INSERT INTO certificados (usuario_id, curso_id, codigo, archivo_pdf, url_validacion, numero_registro) VALUES
(
  (SELECT id FROM usuarios WHERE correo = 'maria.rodriguez@insteip.com'),
  (SELECT id FROM cursos WHERE nombre = 'Desarrollo Web Moderno con Angular'),
  'CERT-ANG-2026-8891',
  'https://assets.insteip.com/certificados/maria-rodriguez-angular.pdf',
  'https://insteip.com/validar/CERT-ANG-2026-8891',
  'REG-2026-90812'
);

-- =========================================================================
-- 14. SEED: plantilla_certificado (NUEVO)
-- =========================================================================
INSERT INTO plantilla_certificado (nombre, imagen_fondo, firma_director, cargo_director, activo) VALUES
(
  'Plantilla Oficial INSTEIP v1',
  'https://assets.insteip.com/plantillas/fondo-certificado.png',
  'https://assets.insteip.com/plantillas/firma-director.png',
  'Director de Asuntos Académicos',
  TRUE
);

-- =========================================================================
-- 15. SEED: configuracion_institucion
-- =========================================================================
INSERT INTO configuracion_institucion (nombre_institucion, logo_url, correo_contacto, telefono, qr_yape, qr_plin, paypal_url) VALUES
(
  'INSTEIP - Instituto de Tecnología e Innovación Profesional',
  'https://insteip.com/assets/img/logo.png',
  'contacto@insteip.com',
  '+51 999 888 777',
  'https://insteip.com/assets/img/qr-yape.png',
  'https://insteip.com/assets/img/qr-plin.png',
  'https://paypal.me/insteip'
);
