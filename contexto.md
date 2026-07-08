# Contexto General del Sistema - INSTEIP

Este documento resume el estado funcional y técnico actual del sistema **INSTEIP**, para que cualquier persona del equipo pueda entender de forma rápida la arquitectura, los roles, el alcance de la API y el flujo del frontend.

## 1. Resumen

INSTEIP es una plataforma académica para gestionar cursos, módulos, videos, materiales, matrículas, avance de alumnos, certificados, auditoría y configuración institucional.

El sistema maneja tres perfiles principales:

- `ADMINISTRADOR`: administra usuarios, cursos, reportes, auditoría, configuración y sistema.
- `DOCENTE`: gestiona sus cursos asignados, contenidos y alumnos asociados.
- `ALUMNO`: accede a sus cursos matriculados, reproduce videos, descarga materiales y visualiza certificados.

## 2. Arquitectura

La solución está separada en cliente y servidor:

```text
[ Angular 18 ] <--> [ Spring Boot 3 / Java 21 ] <--> [ PostgreSQL 15 ]
```

Componentes relevantes:

- Frontend en Angular con rutas protegidas, interceptores, guards y componentes reutilizables.
- Backend REST en Spring Boot con seguridad JWT, validaciones, auditoría y reglas por rol.
- Base de datos PostgreSQL con entidades relacionales para usuarios, cursos y trazabilidad.

## 3. Stack

- Frontend: Angular 18, TypeScript, RxJS, HTML, CSS.
- Backend: Spring Boot 3.4, Java 21, Spring Security, Spring Data JPA, Hibernate.
- Persistencia: PostgreSQL 15.
- PDFs: OpenPDF.
- Automatización: JUnit, Mockito, Playwright, scripts Node.js de integración.

## 4. Modelo De Datos

Tablas principales:

- `roles`
- `niveles_suscripcion`
- `usuarios`
- `pagos`
- `login_auditoria`
- `eventos_sistema`
- `refresh_tokens`
- `cursos`
- `curso_niveles_suscripcion`
- `modulos`
- `videos`
- `materiales`
- `matriculas`
- `avance_videos`
- `avance_cursos`
- `certificados`
- `plantilla_certificado`
- `configuracion_institucion`

Relaciones importantes:

- Un curso puede tener un docente asignado.
- Un curso contiene módulos.
- Un módulo contiene videos y materiales.
- Un alumno puede matricularse en cursos y registrar avance.
- Un certificado se emite por alumno y por curso.

## 5. Seguridad

Puntos clave:

- Autenticación con JWT.
- Refresh token para mantener sesión.
- Bloqueo por intentos fallidos.
- Auditoría de login y eventos del sistema.
- Control por rol en rutas y endpoints.
- Validaciones de acceso por curso, módulo, video y material.
- Descargas protegidas para materiales y certificados.

## 6. Frontend

Rutas públicas:

- `/inicio`
- `/programas`
- `/recursos`
- `/certificacion`
- `/por-que-elegirnos`
- `/cursos`
- `/cursos/:id`
- `/login`
- `/certificados/validar/:codigo`

Rutas privadas:

- `/dashboard`
- `/dashboard/alumnos`
- `/dashboard/docentes`
- `/dashboard/cursos`
- `/dashboard/cursos/:id`
- `/dashboard/certificados`
- `/dashboard/auditoria`
- `/dashboard/sistema`
- `/dashboard/configuracion`
- `/dashboard/mis-cursos`
- `/dashboard/cursos-play/:id`
- `/dashboard/perfil`
- `/dashboard/mis-cursos-docente`
- `/dashboard/mis-alumnos-docente/:id`

La interfaz del admin usa una barra lateral con accesos dinámicos por rol.

## 7. API Actual

Base general: `/api`

Principales grupos:

- `/api/auth`
- `/api/usuarios`
- `/api/usuarios/docentes`
- `/api/cursos`
- `/api/modulos`
- `/api/videos`
- `/api/materiales`
- `/api/matriculas`
- `/api/avance`
- `/api/certificados`
- `/api/reportes`
- `/api/auditoria`
- `/api/sistema`
- `/api/configuracion`
- `/api/alumno`
- `/api/docente`

### Docentes

El backend expone un CRUD específico para docentes:

- `GET /api/usuarios/docentes`
- `GET /api/usuarios/docentes/{id}`
- `POST /api/usuarios/docentes`
- `PUT /api/usuarios/docentes/{id}`
- `PATCH /api/usuarios/docentes/{id}/estado`

Ese flujo usa un DTO propio para docentes y no exige `nivelSuscripcionId`.

## 8. Flujo Docente

El docente puede:

- ver solo sus cursos asignados,
- gestionar contenido de sus cursos,
- revisar alumnos y progreso,
- trabajar sobre módulos, videos y materiales permitidos por seguridad.

El administrador sigue siendo quien asigna docentes a cursos desde el frontend.

## 9. QA

Estado verificado recientemente:

- `backend`: `./mvnw test -q`
- `frontend`: `npm run build`

La suite de backend valida autenticación, usuarios, cursos, módulos, videos, materiales, matrículas, avance, certificados, reportes, sistema y configuración.

## 10. Despliegue Local

1. Levantar base de datos:

```bash
docker compose up -d
```

2. Backend:

```bash
cd backend
./mvnw spring-boot:run
```

3. Frontend:

```bash
cd frontend
npm install
npm start
```

## 11. Observaciones

- Si cambian rutas o permisos, actualizar este archivo junto con el `README.md`.
- Si se agrega un nuevo rol o panel, documentarlo aquí con sus endpoints y alcance.
- Este documento sirve como contexto operativo para desarrollo, pruebas y mantenimiento.
