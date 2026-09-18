-- ====================================================================
-- MIGRACIÓN V8: AMPLIAR COLUMNAS A TIPO TEXT PARA BASE64 Y URLs LARGAS
-- ====================================================================

-- 1. Tabla de Anuncios Modales (soporte para imágenes en Base64 y enlaces extensos)
ALTER TABLE anuncios_modal ALTER COLUMN imagen_url TYPE TEXT;
ALTER TABLE anuncios_modal ALTER COLUMN boton_url TYPE TEXT;

-- 2. Tabla de Notificaciones (soporte para adjuntos e imágenes en Base64 y URLs extensas)
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE notificaciones ALTER COLUMN url_destino TYPE TEXT;
ALTER TABLE notificaciones ALTER COLUMN adjunto_url TYPE TEXT;
