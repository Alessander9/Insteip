# Contexto General del Sistema - INSTEIP

Este documento recopila toda la información técnica, de negocio y de infraestructura del sistema **INSTEIP** (Campus Virtual y Plataforma E-Learning). Sirve como punto de referencia para entender la arquitectura, el modelo de datos, la seguridad, las pruebas automatizadas y los flujos operativos.

---

## 📌 1. Resumen del Sistema

**INSTEIP** es una plataforma de educación en línea dirigida a estudiantes y administradores que integra:
- Un **Catálogo de Cursos** público y privado con temarios divididos en módulos y videos de YouTube.
- Un **Reproductor de Video Interactivo** que mide y persiste el avance de visualización del estudiante en tiempo real.
- Un **Generador de Certificados Digitales** en PDF con firmas de directores y códigos únicos de validación pública.
- Un **Gestor de Pagos Manuales** donde el estudiante solicita suscripciones (`BASICO`, `INTERMEDIO`, `PREMIUM`) mediante transferencia y el administrador valida/aprueba la transacción.
- Un **Módulo de Auditoría de Seguridad** que registra intentos de sesión, bloqueos de cuenta y acciones administrativas críticas.

---

## 📊 2. Arquitectura de Software

El sistema está implementado bajo un enfoque desacoplado de cliente-servidor:

```
[ Frontend: Angular 18 ] <--- (HTTP REST + Bearer JWT) ---> [ Backend: Spring Boot 3 + Java 21 ]
                                                                     |
                                                                     v
                                                          [ Base de Datos: PostgreSQL 15 ]
```

### 📁 Estructura del Repositorio

- **`database/`**: Scripts SQL de definición de tablas e inserción de datos semilla, además del orquestador Docker Compose.
- **`backend/`**: Código fuente de Spring Boot 3, configuración de Maven (`pom.xml`), propiedades de aplicación y suites de pruebas unitarias con JUnit/Mockito.
- **`frontend/`**: Proyecto de Angular con componentes reactivos, enrutado dinámico, interceptores HTTP, guardianes de ruta y archivos de estilo CSS vainilla.
- **`manual-assets/`**: Capturas de pantalla tomadas automáticamente del campus virtual en vivo.
- **`super-test.js`**: Pruebas visuales automatizadas de extremo a extremo (E2E) con Playwright.
- **`backend-api-super-test.js`**: Pruebas automáticas de integración de todos los endpoints REST de la API.
- **`generate-manual.js`**: Generador automático del manual visual en HTML y PDF.

---

## 🗄️ 3. Modelo y Estructura de Base de Datos (PostgreSQL)

La base de datos relacional de INSTEIP está diseñada en PostgreSQL y cuenta con las siguientes tablas:

### 📋 Listado de Tablas y Atributos Clave

1. **`roles`**: Define los niveles de permisos de los usuarios.
   - Campos: `id`, `nombre` (UNIQUE), `estado`, `fecha_creacion`.
2. **`niveles_suscripcion`**: Define los niveles de acceso a los cursos.
   - Campos: `id`, `nombre` (UNIQUE), `descripcion`, `estado`, `fecha_creacion`.
3. **`usuarios`**: Almacena las cuentas de usuarios con control de intentos fallidos.
   - Campos: `id`, `rol_id` (FK), `nivel_suscripcion_id` (FK), `nombres`, `apellidos`, `correo` (UNIQUE), `password_hash`, `telefono`, `estado`, `fecha_registro`, `intentos_fallidos`, `bloqueado_hasta`.
4. **`pagos`**: Gestión manual de transferencias para adquirir niveles de suscripción.
   - Campos: `id`, `usuario_id` (FK), `nivel_suscripcion_id` (FK), `monto`, `metodo_pago`, `numero_operacion`, `observaciones`, `aprobado`, `fecha_pago`, `fecha_aprobacion`, `aprobado_por` (FK).
5. **`login_auditoria`**: Registra los intentos de inicio de sesión de los usuarios.
   - Campos: `id`, `usuario_id` (FK), `correo`, `ip`, `user_agent`, `exitoso`, `motivo`, `fecha`.
6. **`eventos_sistema`**: Bitácora para el rastreo de acciones del administrador en la plataforma.
   - Campos: `id`, `usuario_id` (FK), `modulo`, `accion`, `descripcion`, `fecha`.
7. **`refresh_tokens`**: Tokens de actualización para mantener la sesión del usuario.
   - Campos: `id`, `usuario_id` (FK), `token` (UNIQUE), `expiracion`, `activo`, `fecha_creacion`.
8. **`cursos`**: Información de los programas educativos.
   - Campos: `id`, `nombre`, `descripcion`, `imagen_portada`, `estado`, `fecha_creacion`.
9. **`curso_niveles_suscripcion`**: Vincula los cursos con las suscripciones permitidas (Many-to-Many).
   - Campos: `id`, `curso_id` (FK), `nivel_suscripcion_id` (FK), `fecha_creacion`.
10. **`modulos`**: Estructura de temas en los que se divide un curso.
    - Campos: `id`, `curso_id` (FK), `nombre`, `descripcion`, `orden`, `estado`.
11. **`videos`**: Contenido audiovisual de cada módulo.
    - Campos: `id`, `modulo_id` (FK), `titulo`, `descripcion`, `youtube_url`, `youtube_id`, `duracion_segundos`, `orden`, `estado`, `fecha_creacion`.
12. **`materiales`**: Archivos adjuntos y lecturas complementarias.
    - Campos: `id`, `modulo_id` (FK), `nombre`, `archivo_url`, `archivo_interno` (UNIQUE), `tipo_archivo`, `peso_bytes`, `estado`, `fecha_subida`.
13. **`matriculas`**: Registra qué estudiante está inscrito en qué curso.
    - Campos: `id`, `usuario_id` (FK), `curso_id` (FK), `fecha_matricula`, `estado`.
14. **`avance_videos`**: Seguimiento de los segundos reproducidos por video de cada alumno.
    - Campos: `id`, `usuario_id` (FK), `video_id` (FK), `ultimo_segundo`, `porcentaje_visto`, `completado`, `fecha_actualizacion`.
15. **`avance_cursos`**: Seguimiento consolidado del porcentaje de completitud del curso.
    - Campos: `id`, `usuario_id` (FK), `curso_id` (FK), `porcentaje_avance`, `completado`, `fecha_actualizacion`.
16. **`certificados`**: Registro de certificados oficiales emitidos.
    - Campos: `id`, `usuario_id` (FK), `curso_id` (FK), `codigo` (UNIQUE), `archivo_pdf`, `fecha_emision`, `url_validacion`, `numero_registro`.
17. **`plantilla_certificado`**: Configuración visual y firmas digitales del certificado del campus.
    - Campos: `id`, `nombre`, `imagen_fondo`, `firma_director`, `cargo_director`, `activo`.
18. **`configuracion_institucion`**: Parámetros del portal educativo (enlaces de pago, contacto, logotipos).
    - Campos: `id`, `nombre_institucion`, `logo_url`, `correo_contacto`, `telefono`, `qr_yape`, `qr_plin`, `paypal_url`.

---

## ☕ 4. Backend (Spring Boot 3 + Java 21)

El backend expone servicios REST seguros usando **Spring Security** y **JWT** en el puerto `8081`. 

### 🛡️ Políticas de Seguridad Clave
- **Filtros JWT**: Extrae el token de la cabecera `Authorization: Bearer <token>` y valida la firma.
- **Control de Fuerza Bruta**: Incrementa `intentos_fallidos` en inicios de sesión incorrectos. Al llegar a 5 intentos consecutivos erróneos, bloquea la cuenta estableciendo `bloqueado_hasta` por 15 minutos.
- **Acceso Autorizado**: Solo los usuarios con rol `ADMINISTRADOR` pueden consumir las rutas `/api/usuarios`, `/api/cursos` (edición), `/api/sistema`, `/api/auditoria` y `/api/configuracion`.
- **Descargas Protegidas**: El endpoint de descarga de materiales didácticos (`/api/materiales/{id}/download`) verifica mediante tokens que el usuario esté logueado y tenga una matrícula activa en el curso al que pertenece el recurso.
- **Generador de Certificados**: Genera documentos PDF apaisados (formato A4 landscape) con diseño institucional y firmas dinámicas utilizando OpenPDF, asignando una URL de validación pública accesible por terceros.

---

## 🅰️ 5. Frontend (Angular 18)

Desarrollado con componentes funcionales y modularizado mediante Lazy Loading.

### 🧭 Rutas Principales
- **Públicas**: `/inicio`, `/programas`, `/recursos`, `/certificacion`, `/por-que-elegirnos`, `/cursos`, `/cursos/:id`, `/login`, y `/certificados/validar/:codigo`.
- **Estudiante (Privadas)**: `/dashboard/mis-cursos`, `/dashboard/cursos-play/:id` (reproductor interactivo con actualización en tiempo real), `/dashboard/certificados` y `/dashboard/perfil`.
- **Administrador (Privadas)**: `/dashboard/alumnos` (gestión CRUD), `/dashboard/cursos` (gestión de temario, módulos, videos, materiales), `/dashboard/auditoria` (logs de acceso y eventos), `/dashboard/sistema` (estado del servidor y backups) y `/dashboard/configuracion` (parámetros globales).

---

## 🧪 6. Suites de Prueba y QA

La estabilidad de la plataforma se garantiza a través de pruebas en tres niveles de desarrollo:

1. **Unitarias (Backend)**:
   - **`AuthServiceImplTest`**: Cobertura de login exitoso, bloqueo de cuenta por reintentos fallidos, persistencia de auditoría y refresco de tokens JWT.
   - **`MaterialServiceImplTest`**: Control de subida de archivos (límite de 10MB y rechazo de ejecutables peligrosos `.exe`, `.bat`, etc.) y validaciones de permisos de descarga.
2. **Pruebas de API de Integración**:
   - `backend-api-super-test.js`: Envía solicitudes directas a los endpoints de la API (CRUDs, generación de certificados, reportes CSV y estatus de monitoreo) con validación de respuestas correctas.
3. **Pruebas E2E de Frontend**:
   - `super-test.js`: Ejecuta en Playwright flujos completos sobre la UI real (iniciar sesión, interactuar con el temario del administrador, crear cursos, registrar progreso del estudiante y validar la descarga final del certificado).

---

## 🚀 7. Instrucciones de Despliegue Local

### Requisitos Previos
- Docker y Docker Compose instalados.
- Node.js y npm instalados.
- Java 21 y Maven 3.9+ configurados.

### Paso 1: Levantar la Base de Datos con Docker
Desde la raíz del proyecto, ejecute:
```bash
docker compose up -d
```
Esto inicializa un contenedor de PostgreSQL expuesto en el puerto `5432` con la base de datos `insteip_db`. Los esquemas e inserciones semilla se cargan de forma automática si es la primera ejecución.

### Paso 2: Ejecutar el Servidor Backend
Acceda al directorio del backend y ejecute:
```bash
cd backend
mvn spring-boot:run
```
El servidor backend iniciará en el puerto `8081`.

### Paso 3: Ejecutar el Cliente Frontend
Acceda al directorio del frontend, instale las dependencias y ejecute el servidor de desarrollo:
```bash
cd frontend
npm install
npm run start
```
La aplicación Angular se expondrá en `http://localhost:4200`.

### Paso 4: Pruebas Automáticas y Manual Visual (Opcional)
Para correr las pruebas automáticas visuales o compilar el manual de usuario actualizado:
```bash
# Instalar Playwright en el directorio raíz
npm install

# Correr las pruebas visuales automatizadas
node super-test.js

# Correr las pruebas de integración de endpoints REST
node backend-api-super-test.js

# Regenerar el Manual de Usuario Visual
node generate-manual.js
```
