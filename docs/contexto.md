# Contexto General del Sistema - INSTEIP

Este documento resume el estado funcional y técnico actual del sistema **INSTEIP**, para que cualquier persona del equipo pueda entender de forma rápida la arquitectura, los roles, el alcance de la API y el flujo del frontend.

## 1. Resumen

INSTEIP es una plataforma académica para gestionar cursos, módulos, videos, materiales, matrículas, avance de alumnos, certificados, auditoría y configuración institucional.

El sistema maneja tres perfiles principales:

- `ADMINISTRADOR`: administra usuarios, cursos, reportes, auditoría, configuración y sistema.
- `DOCENTE`: gestiona sus cursos asignados, contenidos y alumnos asociados.
- `ALUMNO`: accede a sus cursos matriculados, reproduce videos, descarga materiales y visualiza certificados.

## 2. Arquitectura

La solución sigue una **arquitectura por capas** (Layered Architecture) con separación clara de responsabilidades:

```text
[ Angular 18 ] <--> [ Spring Boot 3 / Java 21 ] <--> [ PostgreSQL 15 ]
```

### Backend (Spring Boot) - Capas

```
controller/          ← Capa de presentación (REST controllers)
service/             ← Capa de negocio (interfaces + implementaciones)
repository/          ← Capa de datos (Spring Data JPA)
domain/
  ├── entity/       ← Entidades JPA
  ├── dto/<13 subs> ← DTOs organizados por dominio (auth, curso, usuario, etc.)
  └── exception/    ← Excepciones de negocio
infrastructure/
  ├── security/     ← JWT, autenticación, filtros
  ├── config/       ← Configuración global y seeders
  ├── scheduler/    ← Tareas programadas (backup automático)
  └── util/         ← Utilidades transversales
```

### Frontend (Angular) - Capas

```
core/
  ├── models/       ← Interfaces de datos (con barrel exports)
  ├── services/     ← Servicios HTTP (con barrel exports)
  ├── guards/       ← Route guards
  ├── interceptors/ ← HTTP interceptors (JWT)
  ├── components/   ← Componentes compartidos (confirm-modal, footer, navbar, social-sidebar, toast)
  └── utils/        ← Utilidades (file, youtube, listing, subscription)
features/            ← Componentes organizados por dominio de negocio
  ├── inicio/       ← Página de inicio
  ├── auth/login/   ← Inicio de sesión
  ├── cursos/       ← Cursos públicos y detalle público
  ├── certificacion/, programas/, recursos/, por-que-elegirnos/  ← Páginas públicas
  ├── validar-certificado/  ← Validación pública de certificados
  └── dashboard/    ← Paneles privados por rol
       ├── dashboard-home/      ← Home (adaptado por rol)
       ├── alumnos/             ← CRUD alumnos (admin)
       ├── docentes/            ← CRUD docentes (admin)
       ├── cursos/              ← Gestión cursos (admin)
       │    └── curso-detalle/  ← Detalle de curso (admin + docente)
       ├── configuracion/       ← Config. institucional (admin)
       ├── auditoria/           ← Auditoría (admin)
       ├── sistema/             ← Monitoreo (admin)
       ├── videos/              ← Gestión videos (admin + docente)
       ├── materiales/          ← Gestión materiales (admin + docente)
       ├── certificados/        ← Certificados (admin + alumno)
       ├── docente/             ← Paneles de docente
       │    ├── mis-cursos-docente/
       │    └── mis-alumnos-docente/
       ├── mis-cursos/          ← Cursos del alumno
       ├── play-curso/          ← Reproductor de clases
       └── perfil/              ← Perfil (todos los roles)
```

### Path Aliases (tsconfig.json)

Se configuraron alias para imports más limpios en el frontend:

```json
"baseUrl": ".",
"paths": {
  "@core/*":     ["src/app/core/*"],
  "@features/*": ["src/app/features/*"],
  "@env/*":      ["src/environments/*"]
}
```

### Principios Aplicados

- **Single Responsibility**: Cada capa tiene una única responsabilidad bien definida.
- **Dependency Inversion**: Servicios dependen de interfaces, no de implementaciones concretas.
- **Separation of Concerns**: Lógica de negocio separada de la capa de presentación y datos.
- **Barrel Exports**: Imports limpios mediante archivos `index.ts` en cada paquete.

### Seguridad

- Autenticación con JWT + Refresh Tokens.
- Control de acceso por rol (ADMINISTRADOR, DOCENTE, ALUMNO) en rutas y endpoints.
- Bloqueo por intentos fallidos de login.
- Auditoría de eventos del sistema y accesos.
- Descargas protegidas para materiales y certificados.

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

Rutas privadas (dashboard):

| Ruta | Roles |
|---|---|
| `/dashboard` | Todos |
| `/dashboard/perfil` | Todos |
| `/dashboard/alumnos` | ADMINISTRADOR |
| `/dashboard/docentes` | ADMINISTRADOR |
| `/dashboard/cursos` | ADMINISTRADOR |
| `/dashboard/configuracion` | ADMINISTRADOR |
| `/dashboard/auditoria` | ADMINISTRADOR |
| `/dashboard/sistema` | ADMINISTRADOR |
| `/dashboard/cursos/:id` | ADMINISTRADOR, DOCENTE |
| `/dashboard/modulos/:id/videos` | ADMINISTRADOR, DOCENTE |
| `/dashboard/modulos/:id/materiales` | ADMINISTRADOR, DOCENTE |
| `/dashboard/mis-cursos-docente` | DOCENTE |
| `/dashboard/mis-alumnos-docente/:id` | DOCENTE |
| `/dashboard/mis-cursos` | ALUMNO |
| `/dashboard/cursos-play/:id` | ALUMNO |
| `/dashboard/certificados` | ADMINISTRADOR, ALUMNO |

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

Los listados críticos ya trabajan con paginación real y orden por fecha desde backend en:

- alumnos,
- cursos,
- docentes,
- certificados,
- videos por módulo,
- materiales por módulo.

## 8. Flujo Docente

El docente puede:

- ver solo sus cursos asignados,
- gestionar contenido de sus cursos,
- revisar alumnos y progreso,
- trabajar sobre módulos, videos y materiales permitidos por seguridad.

El administrador sigue siendo quien asigna docentes a cursos desde el frontend.

## 9. QA

Estado de verificación y calidad del sistema:

- **Pruebas de Backend**: `./mvnw test` ejecutándose sobre base de datos Postgres (con 53 tests integrados y unitarios pasando en su totalidad).
- **Pruebas del Frontend**: compilación exitosa sin advertencias (`npm run build`).
- **Súper Test E2E de Selenium**: `scripts/tests/e2e/selenium-super-test.js` con 14/14 pasos OK.

Documento maestro de QA:

- [docs/QA_UNIFICADO.md](./QA_UNIFICADO.md)

## 10. Estructura del Proyecto (Organizada)

```
📁 raíz
├── backend/              ← API Spring Boot 3.4 (arquitectura por capas)
│   ├── src/main/java/.../controller/
│   ├── src/main/java/.../service/
│   │   ├── interfaces/
│   │   └── impl/
│   ├── src/main/java/.../repository/
│   ├── src/main/java/.../domain/
│   │   ├── entity/
│   │   ├── dto/ (13 subdominios)
│   │   └── exception/
│   ├── src/main/java/.../infrastructure/
│   │   ├── security/
│   │   ├── config/
│   │   ├── scheduler/
│   │   └── util/
│   └── src/test/java/.../
│       ├── controller/
│       ├── service/impl/
│       └── infrastructure/security/
├── frontend/             ← App Angular 18
│   └── src/app/
│       ├── core/         ← Servicios, modelos, guards, interceptors, utils
│       └── features/     ← Componentes por dominio
├── database/             ← Scripts SQL (schema.sql, seed.sql)
├── docs/                 ← Documentación y QA
│   ├── assets/
│   │   └── manual-assets/  ← Capturas de pantalla del manual
│   ├── contexto.md
│   ├── QA_UNIFICADO.md
│   └── ...
├── scripts/              ← Tests E2E y utilidades
│   ├── tests/
│   │   ├── api/          ← backend-api-super-test.js
│   │   └── e2e/          ← selenium-super-test.js, super-test.js
│   ├── tools/            ← generate-manual.js
│   └── downloads/        ← CSVs y PDFs generados por tests
├── run-logs/             ← Logs de ejecución (backend/frontend, ignorado por git)
├── .gitignore
├── docker-compose.yml    ← PostgreSQL 15
├── package.json          ← Dependencias para scripts (Selenium, Playwright)
└── README.md
```

## 11. Despliegue Local

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

## 12. Observaciones

- Si cambian rutas o permisos, actualizar este archivo junto con el `README.md`.
- Si se agrega un nuevo rol o panel, documentarlo aquí con sus endpoints y alcance.
- `DOCENTE` es el rol operativo del sistema; el frontend y backend ya lo contemplan como panel separado y como asignación de cursos.
- El módulo de backup depende de `pg_dump`; si no existe en el entorno, el sistema usa un fallback controlado.
- Los logs de ejecución se almacenan en `run-logs/` (ignorados por git).
- Los CSVs y PDFs de prueba generados por los scripts de testing se almacenan en `scripts/downloads/`.
- Los path aliases `@core/*`, `@features/*`, `@env/*` están configurados en `tsconfig.json` para imports más limpios.
- Este documento sirve como contexto operativo para desarrollo, pruebas y mantenimiento.
