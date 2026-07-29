# 🖥️ Información del Servidor y Despliegue — INSTEIP

Documento de referencia técnica con la información de acceso, configuración del servidor, claves SSH y comandos necesarios para desplegar cambios a producción.

---

## 📌 1. Información General de la Infraestructura

| Parámetro | Valor / Detalle |
|---|---|
| **Proveedor VPS** | Contabo (Cloud VPS Core 6) |
| **Dominio Principal** | [https://insteip.com](https://insteip.com) |
| **Proveedor DNS** | DonWeb (Apuntando registros A a `62.146.226.81`) |
| **IP del Servidor** | `62.146.226.81` |
| **Sistema Operativo** | Ubuntu 24.04 LTS |
| **Usuario SSH** | `root` |
| **Panel de Control VPS** | [my.contabo.com](https://my.contabo.com) (Sección *VPS control* -> *Manage*) |

---

## 🔑 2. Credenciales y Claves de Acceso SSH

### Acceso SSH mediante Clave Pública (Configurado y Activo)
Tu computadora y el servidor Contabo están vinculados con una clave SSH ED25519 de alta seguridad. **No necesitas escribir contraseña para conectarte o desplegar.**

- **Clave Privada Local:** `C:\Users\Alessander\.ssh\id_ed25519`
- **Clave Pública Local:** `C:\Users\Alessander\.ssh\id_ed25519.pub`
- **Identificador de Clave en Contabo:** `mi-pc-insteip`
- **Valor de la Clave Pública:**
  ```text
  ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILIOQ4wIzxMIOu1UAMULnfTLqPX9jvntmJ9NoqUmO0qp alessander@DESKTOP-MRK7PSU
  ```

### Contraseña de Usuario `root`
- **Uso:** Solo necesaria si te conectas desde otra computadora que no tenga la clave SSH autorizada o si ingresas por la consola web VNC de Contabo.
- **Gestión:** Puedes consultar la contraseña inicial en el correo de bienvenida de Contabo (*"Your VPS is ready"*) o restablecerla en cualquier momento desde el panel [my.contabo.com](https://my.contabo.com) (*VPS control -> Manage -> Password Reset*).

---

## 🚀 3. Comandos Rápidos de Despliegue a Producción

Puedes ejecutar estos comandos directamente en tu terminal (PowerShell, Git Bash o desde la IA):

### A. Desplegar Todo (Frontend + Backend)

**Desde Git Bash, WSL o Linux:**
```bash
./scripts/deploy-update.sh root@62.146.226.81
```

**Desde PowerShell:**
```powershell
# 1. Compilar y subir Frontend
npm run build --prefix frontend -- --configuration production
scp -r frontend/dist/frontend/* root@62.146.226.81:/var/www/insteip/
ssh root@62.146.226.81 "systemctl reload nginx"

# 2. Compilar y subir Backend
cd backend; .\mvnw.cmd clean package -DskipTests; cd ..
scp backend/target/*.jar root@62.146.226.81:/opt/insteip/backend.jar
ssh root@62.146.226.81 "systemctl restart insteip-backend"
```

---

### B. Desplegar Solo el Frontend (Modificaciones en UI / Angular)

**Desde Git Bash, WSL o Linux:**
```bash
./scripts/deploy-update.sh root@62.146.226.81 --skip-backend
```

**Desde PowerShell:**
```powershell
npm run build --prefix frontend -- --configuration production
scp -r frontend/dist/frontend/* root@62.146.226.81:/var/www/insteip/
ssh root@62.146.226.81 "systemctl reload nginx"
```

---

### C. Desplegar Solo el Backend (Modificaciones en Java / Spring Boot)

**Desde Git Bash, WSL o Linux:**
```bash
./scripts/deploy-update.sh root@62.146.226.81 --skip-frontend
```

**Desde PowerShell:**
```powershell
cd backend; .\mvnw.cmd clean package -DskipTests; cd ..
scp backend/target/*.jar root@62.146.226.81:/opt/insteip/backend.jar
ssh root@62.146.226.81 "systemctl restart insteip-backend"
```

---

## 📁 4. Estructura de Rutas en el Servidor Producción

| Componente | Ruta en Servidor VPS |
|---|---|
| **Directorio Raíz de la App** | `/opt/insteip/` |
| **Archivos Estáticos Frontend** | `/var/www/insteip/` |
| **Archivo Ejecutable Backend** | `/opt/insteip/backend.jar` |
| **Archivos Subidos / Materiales** | `/opt/insteip/data/materiales/` |
| **Configuración de Variables** | `/etc/insteip/backend.env` |
| **Configuración Nginx** | `/etc/nginx/sites-available/default` |

---

## 🛠️ 5. Comandos Útiles de Mantenimiento en el Servidor

Para conectarte directamente por SSH al servidor desde tu consola:
```powershell
ssh root@62.146.226.81
```

- **Ver logs en tiempo real del backend:**
  ```bash
  journalctl -u insteip-backend -f
  ```
- **Verificar estado de los servicios:**
  ```bash
  systemctl status insteip-backend
  systemctl status nginx
  docker ps
  ```
- **Reiniciar servicios manualmente:**
  ```bash
  systemctl restart insteip-backend
  systemctl reload nginx
  ```
