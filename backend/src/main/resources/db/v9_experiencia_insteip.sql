-- ====================================================================
-- MIGRACIÓN V9: TABLA Y ESTRUCTURAS PARA EXPERIENCIA INSTEIP
-- ====================================================================

-- 1. Tabla para registrar los accesos de prueba gratuita (15 minutos)
CREATE TABLE IF NOT EXISTS experiencias_usos (
    id            BIGSERIAL PRIMARY KEY,
    numero_uso    INTEGER NOT NULL DEFAULT 1,       -- 1, 2 o 3 (máximo 3 usos totales)
    correo        VARCHAR(150) NOT NULL,             -- Correo ingresado por el visitante
    ip            VARCHAR(100),                      -- IP pública del visitante (extraída vía Nginx/X-Real-IP)
    cookie_id     VARCHAR(100),                      -- UUID identificador del navegador
    cursos_vistos BIGINT[] NOT NULL,                 -- Array con los IDs de cursos seleccionados en la sesión
    fecha_uso     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expira_en     TIMESTAMP NOT NULL                 -- Timestamp hasta el cual queda bloqueado (= fecha_uso + 7 días)
);

-- 2. Índices para optimizar las consultas de validación de visitante
CREATE INDEX IF NOT EXISTS idx_exp_usos_correo    ON experiencias_usos(correo);
CREATE INDEX IF NOT EXISTS idx_exp_usos_ip        ON experiencias_usos(ip);
CREATE INDEX IF NOT EXISTS idx_exp_usos_cookie    ON experiencias_usos(cookie_id);
CREATE INDEX IF NOT EXISTS idx_exp_usos_expira_en ON experiencias_usos(expira_en);
