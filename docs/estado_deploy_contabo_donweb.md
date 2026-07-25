# Estado Actual del Deploy de INSTEIP

**Fecha:** 2026-07-25  
**Estado:** Despliegue en producción completado con éxito, HTTPS activo y funcionando con datos reales.  
**Referencia principal:** [plan_predeploy_antes_de_comprar_ionos.md](./plan_predeploy_antes_de_comprar_ionos.md)

## Resumen de Infraestructura

| Elemento | Estado | Detalles |
|---|---|---|
| **VPS Contabo Cloud VPS Core 6** | Activo y Operativo | IP: `62.146.226.81` |
| **Ubuntu 24.04 LTS** | Configurado y Asegurado | Firewall UFW activo (solo puertos `22`, `80` y `443` abiertos) |
| **Dominio `insteip.com`** | Configurado y Apuntando | DNS configurado en DonWeb hacia la IP del VPS |
| **Backend Spring Boot** | Desplegado y Activo | Corriendo mediante systemd (`insteip-backend.service`) en puerto `8081` |
| **Frontend Angular 18** | Desplegado y Activo | Compilado en producción y servido mediante Nginx en `/var/www/insteip` |
| **PostgreSQL 15** | Activo en Docker | Contenedor `insteip-postgres` con puerto expuesto `5455:5432` |
| **Certificado SSL / HTTPS** | Activo y Renovando | Certificado Let's Encrypt configurado con Nginx para `insteip.com` y `www.insteip.com` |
| **Producción Pública** | Operativa | Accesible en [https://insteip.com](https://insteip.com) y API en `/api` |

---

## Estructura de Datos en Producción

La base de datos productiva ha sido migrada y cargada con datos reales y limpios.

### 🔑 Cuentas Creadas

1. **Administrador principal:**
   - **Nombre:** Emanuel Cabanillas
   - **Correo:** `Ecabanillas@insteip.com`
   - **Contraseña:** `conmasfuerza123` (encriptada con BCrypt en base de datos)
   - **Rol:** `ADMINISTRADOR`
2. **Alumnos matriculados:**
   - Se crearon **20 cuentas de estudiantes** reales con rol `ALUMNO`, suscripción `BASICO` y contraseñas seguras preconfiguradas.
   - Todos los alumnos están matriculados activamente en el curso principal **"Formación Anual de Acupuntura"**.
   - El listado de credenciales completo se exportó en un archivo CSV en la raíz del proyecto local: [usuarios_insteip.csv](../usuarios_insteip.csv).

### 📚 Cursos Cargados

Se estructuraron y registraron 5 cursos completos con sus respectivos módulos y videos de clases/prácticas:

1. **Formación Anual de Acupuntura**
   - Módulo I: Fundamentos de Acupuntura (Mes 1) - 5 Clases Teóricas + 6 Prácticas Clínicas.
   - Módulo II: Moxibustión, Ventosas y Estética Facial (Mes 2) - 5 Clases Teóricas + 5 Prácticas Clínicas.
   - Módulo III: Microsistema de Reflexología Podal (Mes 3) - 6 Clases Teóricas + 5 Prácticas Clínicas.
2. **Curso de Auriculoterapia**
   - Módulo I: Introducción y Fundamentos - 1 Introducción + 5 Clases.
   - Módulo II: Localización de Puntos y Técnicas - 5 Clases.
   - Módulo III: Protocolos Clínicos - 3 Casos Clínicos.
   - Módulo IV: Práctica Clínica y Aplicaciones Avanzadas - 3 Clases.
3. **Seminario de Reflexología Podal**
   - Módulo I al Módulo VIII completo con clases teóricas, demostraciones prácticas y protocolos terapéuticos de reflexología.
4. **Seminario de Ventosaterapia y Moxibustión**
   - Módulo I: Fundamentos - 2 Clases.
   - Módulo II: Técnicas de Aplicación - 2 Clases.
   - Módulo III: Prácticas Clínicas Supervisadas - 4 Prácticas.
   - Módulo IV: Casos Clínicos y Aplicación Avanzada - 3 Prácticas.
5. **Taller de Ventosas y Moxibustión**
   - Módulo I: Fundamentos - 2 Clases.
   - Módulo II: Técnicas de Aplicación - 2 Clases.
   - Módulo III: Práctica Clínica - 1 Clase.

---

## Ajustes y Correcciones en Producción

### 1. Visibilidad del Switch de Color (Tema)
Para optimizar el diseño y mantener un aspecto consistente en las páginas de marketing institucional, se restringió la visualización del toggle de tema:
- **Páginas Públicas:** Removido de los menús públicos flotantes y estándar ([card-nav.component.html](../frontend/src/app/core/components/card-nav/card-nav.component.html) y [navbar.component.html](../frontend/src/app/core/components/navbar/navbar.component.html)).
- **Campus Virtual (Dashboard Interno):** Se mantiene visible y funcional en la cabecera ([dashboard.component.html](../frontend/src/app/features/dashboard/dashboard.component.html)) para la comodidad de alumnos y administradores.

### 2. Solución a Error 500 en Descarga de Archivos
Se corrigió un fallo que impedía descargar materiales del curso debido a una URL duplicada `/api/api/materiales/{id}/download`.
- **Origen:** La variable `API_BASE_URL` en `/etc/insteip/backend.env` del servidor incluía el sufijo `/api`, que luego se duplicaba al concatenar la ruta de descarga definida en los servicios Java.
- **Corrección:** Se modificó la variable de entorno a `API_BASE_URL=https://insteip.com` y se reinició el servicio del backend.
- **Migración de Datos:** Se ejecutó un script SQL en producción para corregir las 14 URLs de materiales previamente guardadas en la base de datos, normalizándolas a la ruta correcta `/api/materiales/{id}/download`. Las descargas ahora funcionan perfectamente.

---

## Mantenimiento y Backups

- El script de backup diario realiza copias automatizadas de la base de datos y de la carpeta `/opt/insteip/data/materiales` en el directorio local `/opt/insteip/data/backups/`.
- La renovación de los certificados SSL por Let's Encrypt está configurada de forma automática por Certbot a nivel de Nginx.
