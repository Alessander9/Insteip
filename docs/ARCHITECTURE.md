# Arquitectura del Sistema - INSTEIP

Este documento describe la arquitectura técnica, los patrones de diseño, el marco metodológico **RUP (Rational Unified Process)** y los modelos **UML (Unified Modeling Language)** que sustentan la plataforma académica y campus virtual **INSTEIP**.

---

## 1. Visión General y Estilo Arquitectónico

INSTEIP adopta una **Arquitectura en Tres Capas (Three-Tier Layered Architecture)** desacoplada y orientada a servicios RESTful:

1. **Capa de Presentación (Frontend SPA)**: Desarrollada en **Angular 18** con componentes Standalone, TypeScript, TailwindCSS y RxJS. Consume la API de forma asíncrona mediante HTTP interceptors con inyección automática de tokens JWT.
2. **Capa de Negocio y Aplicación (Backend API)**: Implementada sobre **Spring Boot 3.4** y **Java 21 LTS**, aplicando principios SOLID, inyección de dependencias, Spring Security con arquitectura Stateless (JWT), validación declarativa de datos y orquestación de servicios.
3. **Capa de Datos y Persistencia**: Motor relacional **PostgreSQL 15** administrado mediante Spring Data JPA y Hibernate 6, con scripts SQL de migración y volumen persistente en contenedor Docker.

```mermaid
flowchart TD
    subgraph Cliente["Navegadores & Dispositivos (Cliente)"]
        A["Usuario (Estudiante / Docente / Admin)"]
    end

    subgraph Perimetro["Perímetro de Seguridad & Red"]
        Nginx["Nginx Reverse Proxy / Cloudflare (SSL, Rate Limit, WAF)"]
    end

    subgraph CapaPresentacion["Capa de Presentación (Frontend)"]
        SPA["Angular 18 SPA (Standalone Components, Guards, Interceptors)"]
    end

    subgraph CapaServicio["Capa de Negocio (Backend Spring Boot 3.4)"]
        Ctrl["REST Controllers (/api/*)"]
        Sec["Spring Security (Filtro JWT Stateless)"]
        Srv["Service Layer (Interfaces e Implementaciones de Negocio)"]
        Chatbot["Chatbot Engine (RAG con Llama 3.1 / Gemini)"]
        PDFGen["OpenPDF Engine (Certificados + QR Generator)"]
    end

    subgraph CapaDatos["Capa de Persistencia & Almacenamiento"]
        Repo["Spring Data JPA Repositories"]
        DB[("PostgreSQL 15 (insteip_db)")]
        FS[("File System Local / Contenedor (/uploads)")]
    end

    A -->|HTTPS| Nginx
    Nginx -->|Proxy Estáticos| SPA
    Nginx -->|Proxy API REST| Sec
    Sec --> Ctrl
    Ctrl --> Srv
    Srv --> Repo
    Srv --> Chatbot
    Srv --> PDFGen
    Repo --> DB
    Srv --> FS
    PDFGen --> FS
```

---

## 2. Marco Metodológico RUP (Rational Unified Process)

El desarrollo del sistema INSTEIP sigue la metodología **RUP**, caracterizada por ser:
- **Dirigida por Casos de Uso**: Las necesidades de los alumnos, docentes y administradores guían el diseño, desarrollo y pruebas.
- **Centrada en la Arquitectura**: La estructura en tres capas y el esquema de seguridad fueron priorizados tempranamente para garantizar escalabilidad y robustez.
- **Iterativa e Incremental**: El ciclo de vida se organizó en 4 fases secuenciales con iteraciones controladas y entregables verificables.

### 2.1. Fases del Proceso RUP en INSTEIP

```mermaid
gantt
    title Ciclo de Vida RUP - Proyecto INSTEIP
    dateFormat  YYYY-MM-DD
    section Fase 1: Inicio (Inception)
    Definición de alcance y visión           :done, f1_1, 2026-05-01, 2026-05-15
    Casos de uso clave y viabilidad          :done, f1_2, 2026-05-10, 2026-05-25
    section Fase 2: Elaboración (Elaboration)
    Diseño de arquitectura 3 capas           :done, f2_1, 2026-05-26, 2026-06-15
    Línea base ejecutable (Auth JWT + DB)    :done, f2_2, 2026-06-10, 2026-06-30
    Mitigación de riesgos (QR, OpenPDF, IA)  :done, f2_3, 2026-06-25, 2026-07-10
    section Fase 3: Construcción (Construction)
    Módulo Cursos, Módulos y Videos          :done, f3_1, 2026-07-11, 2026-08-05
    Módulo Tareas, Calificaciones y Alumnos  :done, f3_2, 2026-08-01, 2026-08-25
    Módulo Certificados, Avisos y Chatbot    :done, f3_3, 2026-08-20, 2026-09-15
    section Fase 4: Transición (Transition)
    Pruebas E2E (Selenium / Playwright)      :done, f4_1, 2026-09-16, 2026-10-10
    Hardening perimetral y Nginx             :done, f4_2, 2026-10-05, 2026-10-25
    Puesta en producción y entrega final     :active, f4_3, 2026-10-26, 2026-11-23
```

1. **Fase de Inicio (Inception)**:
   - Identificación de los interesados (Directivos de INSTEIP, docentes de medicina tradicional china/terapias integrales y estudiantes).
   - Definición de requisitos funcionales (gestión de matrículas, cursos online/presenciales, emisión de certificados con QR).
   - Evaluación de viabilidad técnica y estimación de costos operacionales mínimos.

2. **Fase de Elaboración (Elaboration)**:
   - Establecimiento de la línea base arquitectónica (Spring Boot 3.4 + Angular 18 + PostgreSQL).
   - Modelado formal de casos de uso y diagrama de dominio entidad-relación.
   - Resolución de riesgos arquitectónicos: seguridad stateless con JWT, motor de certificados en PDF y latencia del asistente virtual LLM.

3. **Fase de Construcción (Construction)**:
   - Desarrollo iterativo de componentes frontend desacoplados y servicios REST backend.
   - Implementación del sistema de tareas vigesimal (0-20), streaming/reproductor de clases, notificaciones en tiempo real y módulo de auditoría.
   - Refactorización a componentes Standalone en Angular y servicios modulares en Spring Boot.

4. **Fase de Transición (Transition)**:
   - Pruebas integrales de QA automatizadas (suites unitarias con JUnit 5/Mockito y E2E con Selenium WebDriver y Playwright).
   - Despliegue en contenedor Docker y configuración del servidor web Nginx con cabeceras HTTP seguras y compresión Gzip.
   - Generación de manuales técnicos, guías de usuario y auditoría final previa a despliegue.

---

## 3. Modelado UML (Unified Modeling Language)

### 3.1. Diagrama UML de Casos de Uso del Sistema

```mermaid
flowchart LR
    subgraph Actores
        Admin((Administrador))
        Docente((Docente))
        Alumno((Alumno))
        Publico((Visitante / Público))
    end

    subgraph CasosDeUso["Casos de Uso del Sistema INSTEIP"]
        CU1["CU01: Autenticarse (Login / Logout / Refresh)"]
        CU2["CU02: Consultar Catálogo de Cursos"]
        CU3["CU03: Validar Certificado vía QR"]
        CU4["CU04: Consultar Asistente IA (Chatbot)"]
        CU5["CU05: Visualizar Clases y Materiales"]
        CU6["CU06: Entregar Tareas"]
        CU7["CU07: Gestionar Contenido de Curso (Módulos/Videos)"]
        CU8["CU08: Calificar Tareas y Asignar Feedback"]
        CU9["CU09: Gestionar Usuarios (Alumnos/Docentes)"]
        CU10["CU10: Emitir Certificados Oficiales"]
        CU11["CU11: Enviar Comunicados y Gestionar Banners"]
        CU12["CU12: Consultar Logs de Auditoría y Métricas"]
    end

    Publico --> CU2
    Publico --> CU3
    Publico --> CU4

    Alumno --> CU1
    Alumno --> CU5
    Alumno --> CU6
    Alumno --> CU4

    Docente --> CU1
    Docente --> CU7
    Docente --> CU8

    Admin --> CU1
    Admin --> CU7
    Admin --> CU9
    Admin --> CU10
    Admin --> CU11
    Admin --> CU12
```

### 3.2. Diagrama UML de Clases del Dominio

```mermaid
classDiagram
    class Usuario {
        +Long id
        +String nombre
        +String apellido
        +String email
        +String password
        +Rol rol
        +Boolean activo
        +LocalDateTime ultimoAcceso
        +autenticar(password) Boolean
    }

    class Rol {
        <<enumeration>>
        ADMINISTRADOR
        DOCENTE
        ALUMNO
    }

    class Curso {
        +Long id
        +String titulo
        +String descripcion
        +String modalidad
        +String imagenUrl
        +Boolean publicado
        +Long docenteId
        +calcularProgreso(alumnoId) Float
    }

    class Modulo {
        +Long id
        +String titulo
        +Integer orden
        +Long cursoId
    }

    class Video {
        +Long id
        +String titulo
        +String videoUrl
        +Integer duracionMinutos
        +Integer orden
        +Long moduloId
    }

    class Material {
        +Long id
        +String titulo
        +String archivoUrl
        +String tipoArchivo
        +Long moduloId
    }

    class Tarea {
        +Long id
        +String titulo
        +String descripcion
        +LocalDateTime fechaLimite
        +Long moduloId
    }

    class EntregaTarea {
        +Long id
        +String archivoUrl
        +LocalDateTime fechaEntrega
        +BigDecimal calificacion
        +String retroalimentacion
        +String estado
        +Long tareaId
        +Long alumnoId
    }

    class Matricula {
        +Long id
        +LocalDateTime fechaMatricula
        +String estado
        +Long cursoId
        +Long alumnoId
    }

    class Certificado {
        +Long id
        +String codigoUnico
        +LocalDateTime fechaEmision
        +String archivoPdfUrl
        +String codigoQrUrl
        +Long cursoId
        +Long alumnoId
        +validarAutenticidad() Boolean
    }

    Usuario "1" --> "1" Rol : tiene
    Curso "1" --> "*" Modulo : contiene
    Modulo "1" --> "*" Video : agrupa
    Modulo "1" --> "*" Material : adjunta
    Modulo "1" --> "*" Tarea : incluye
    Tarea "1" --> "*" EntregaTarea : recibe
    Usuario "1" --> "*" EntregaTarea : entrega (Alumno)
    Usuario "1" --> "*" Matricula : posee (Alumno)
    Curso "1" --> "*" Matricula : registra
    Usuario "1" --> "*" Curso : dicta (Docente)
    Matricula "1" --> "0..1" Certificado : emite
```

### 3.3. Diagrama UML de Secuencia: Entrega y Calificación de Tareas

```mermaid
sequenceDiagram
    autonumber
    actor Alumno
    actor Docente
    participant SPA as Angular Frontend
    participant Gateway as Nginx / Security Filter
    participant Ctrl as TareasController
    participant Srv as TareasService
    participant DB as PostgreSQL
    participant FS as File System Storage

    %% Alumno entrega tarea
    Alumno->>SPA: Selecciona archivo PDF/Word y pulsa "Entregar Tarea"
    SPA->>Gateway: POST /api/entregas-tareas (Multipart + Bearer Token)
    Gateway->>Ctrl: Petición autenticada (Rol: ALUMNO)
    Ctrl->>Srv: registrarEntrega(tareaId, alumnoId, file)
    Srv->>FS: Guardar archivo con UUID único en /uploads/entregas
    Srv->>DB: INSERT INTO entrega_tarea (tarea_id, alumno_id, archivo_url, estado='ENTREGADO')
    DB-->>Srv: Confirmación de guardado
    Srv-->>Ctrl: EntregaResponseDTO
    Ctrl-->>SPA: 201 Created (Entrega exitosa)
    SPA-->>Alumno: Muestra confirmación de tarea entregada

    %% Docente califica tarea
    Docente->>SPA: Ingresa a "Mis Alumnos" y califica entrega
    SPA->>Gateway: POST /api/entregas-tareas/{id}/calificar (Nota 0-20, Feedback)
    Gateway->>Ctrl: Petición autenticada (Rol: DOCENTE)
    Ctrl->>Srv: calificarEntrega(entregaId, nota, feedback, docenteId)
    Srv->>DB: UPDATE entrega_tarea SET calificacion=18, feedback='...', estado='CALIFICADO'
    Srv->>DB: INSERT INTO notificacion (usuario_id, mensaje, tipo='NOTA_ASIGNADA')
    DB-->>Srv: OK
    Srv-->>Ctrl: EntregaCalificadaDTO
    Ctrl-->>SPA: 200 OK
    SPA-->>Docente: Muestra estado "Calificado" y nota asignada
```

### 3.4. Diagrama UML de Secuencia: Emisión y Validación Pública de Certificado con QR

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    actor Verificador as Empleador / Público
    participant SPA as Angular Frontend
    participant CertCtrl as CertificadosController
    participant CertSrv as CertificadoService
    participant PDF as OpenPDF + QR Generator
    participant DB as PostgreSQL
    participant FS as File System

    Admin->>SPA: Solicita emisión de certificado para alumno egresado
    SPA->>CertCtrl: POST /api/certificados/emitir {cursoId, alumnoId}
    CertCtrl->>CertSrv: generarCertificado(cursoId, alumnoId)
    CertSrv->>CertSrv: Generar código criptográfico único (UUID/Hash)
    CertSrv->>PDF: Crear documento PDF con plantilla oficial
    PDF->>PDF: Incrustar código QR apuntando a /certificados/validar/{codigo}
    PDF->>FS: Guardar PDF oficial en /uploads/certificados
    CertSrv->>DB: INSERT INTO certificado (codigo_unico, curso_id, alumno_id, ruta_pdf)
    DB-->>CertSrv: Registro creado
    CertSrv-->>SPA: 200 OK {codigoUnico, urlPdf}
    SPA-->>Admin: Certificado generado y listo para entrega

    %% Verificación Externa
    Verificador->>SPA: Escanea código QR del diploma físico o PDF
    SPA->>CertCtrl: GET /api/certificados/validar/{codigoUnico} (Público, sin Auth)
    CertCtrl->>CertSrv: verificarCertificado(codigoUnico)
    CertSrv->>DB: SELECT c, u.nombre, cu.titulo FROM certificado c WHERE c.codigo = ?
    DB-->>CertSrv: Datos válidos del egresado
    CertSrv-->>SPA: 200 OK {valido: true, alumno, curso, fechaEmision}
    SPA-->>Verificador: Renderiza pantalla oficial con sello de autenticidad institucional
```

### 3.5. Diagrama UML de Despliegue Físico y Componentes

```mermaid
deploymentDiagram
    node "Cliente Web" {
        artifact "Navegador Web (Chrome/Firefox/Safari)" as Browser
    }

    node "Servidor Cloud / VPS (Ubuntu Server 22.04 LTS)" {
        node "Nginx Web Server" {
            artifact "Reverse Proxy & Static Asset Cache" as NginxProxy
            artifact "Frontend Angular Build (/var/www/insteip)" as AngularDist
        }

        node "Docker Engine" {
            node "Contenedor: insteip-backend" {
                artifact "Spring Boot 3.4 Executable (JAR, OpenJDK 21)" as BackendJar
            }

            node "Contenedor: insteip-postgres" {
                database "PostgreSQL 15 (Puerto interno 5432)" as PostgresData
            }

            node "Host Persistent Volumes" {
                folder "/var/lib/docker/volumes/postgres_data" as DBVolume
                folder "/var/insteip/uploads" as UploadsVolume
            }
        }
    }

    node "Servicios Externos en la Nube" {
        cloud "Groq Cloud API (Llama 3.1 8B Instant)" as GroqAPI
        cloud "Google Gemini API (Gemini 3.5 Flash)" as GeminiAPI
        cloud "Cloudflare DNS / CDN / SSL" as Cloudflare
    }

    Browser --> Cloudflare : HTTPS (Puerto 443)
    Cloudflare --> NginxProxy : Tráfico seguro filtrado
    NginxProxy --> AngularDist : Entrega SPA estática
    NginxProxy --> BackendJar : Proxy inverso REST (Puerto 8081)
    BackendJar --> PostgresData : JDBC Connection Pool (HikariCP)
    BackendJar --> UploadsVolume : Lectura y escritura de PDFs/Imágenes
    PostgresData --> DBVolume : Persistencia física de transacciones
    BackendJar ..> GroqAPI : Inferencia LLM Chatbot (HTTPS REST)
    BackendJar ..> GeminiAPI : Fallback Chatbot (HTTPS REST)
```

---

## 4. Patrones de Diseño Aplicados

- **Arquitectura Limpia / Capas**: Desacoplamiento estricto entre controladores REST, interfaces de servicio, repositorios JPA y entidades de dominio.
- **DTO (Data Transfer Object)**: Encapsulamiento de entradas y respuestas de API para prevenir sobreexposición de entidades y ataques de asignación masiva (Mass Assignment).
- **Inversión de Dependencias (Dependency Injection)**: Uso intensivo de `@Autowired` / inyección por constructor para favorecer la testabilidad con Mockito.
- **Interceptor Pattern**: Interceptores HTTP en Angular para adjuntar el encabezado `Authorization: Bearer <token>` de forma transparente a cada petición.
- **Guard Pattern (Angular Routing)**: `AuthGuard` y `RoleGuard` que evalúan permisos antes de permitir la navegación a vistas del dashboard.
- **Factory / Strategy Pattern**: Adaptadores para el Asistente Virtual que permiten alternar entre proveedores LLM (Groq Llama 3.1, Gemini o fallback OpenRouter) sin alterar el código cliente.

---

## 5. Decisiones Arquitectónicas Clave (ADR Summary)

1. **Autenticación Stateless JWT**: Se eligió JWT sobre sesiones con estado en servidor para reducir el consumo de memoria en el backend y permitir alta concurrencia sin replicación de sesiones.
2. **Angular Standalone Components**: Se adoptó la arquitectura moderna de Angular sin `NgModule` para reducir el tamaño del bundle, acelerar el tiempo de compilación y optimizar la carga diferida (*lazy loading*).
3. **OpenPDF para Certificados**: Generación en servidor de PDFs de alta fidelidad visual con vectorización de firmas y códigos QR dinámicos, garantizando inmutabilidad.
4. **Docker Compose para Base de Datos**: Aislamiento del motor PostgreSQL 15 con volumen dedicado para facilitar despliegues reproducibles tanto en desarrollo local como en producción.
