-- =========================================================================
-- SEMILLA: Talleres Exclusivos - Día de la Acupuntura (17 y 18 de Octubre)
-- INSTEIP - Instituto Superior Tecnológico
-- =========================================================================

DO $$
DECLARE
    v_docente_id BIGINT;
    v_curso_id BIGINT;
    v_modulo_id BIGINT;
BEGIN
    -- Obtener un docente por defecto (o el primero activo)
    SELECT id INTO v_docente_id FROM usuarios WHERE rol_id = (SELECT id FROM roles WHERE nombre = 'DOCENTE') LIMIT 1;
    IF v_docente_id IS NULL THEN
        SELECT id INTO v_docente_id FROM usuarios WHERE rol_id = (SELECT id FROM roles WHERE nombre = 'ADMINISTRADOR') LIMIT 1;
    END IF;

    -- =========================================================================
    -- 1. Auriculoterapia en Sistema Nervioso y Control de Peso
    -- =========================================================================
    IF NOT EXISTS (SELECT 1 FROM cursos WHERE nombre = 'Auriculoterapia en Sistema Nervioso y Control de Peso') THEN
        INSERT INTO cursos (nombre, descripcion, imagen_portada, docente_id, estado)
        VALUES (
            'Auriculoterapia en Sistema Nervioso y Control de Peso',
            'Abordaje clínico auricular para la regulación del estrés, ansiedad, apetito compulsivo y control de peso metabólico mediante estímulos reflexológicos en el pabellón auricular.',
            'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
            v_docente_id,
            TRUE
        ) RETURNING id INTO v_curso_id;

        INSERT INTO modulos (curso_id, nombre, descripcion, orden, estado)
        VALUES (v_curso_id, 'Sesión Magistral: Auriculoterapia Clínica', 'Fundamentos, mapa auricular, puntos clave y protocolos terapéuticos.', 1, TRUE)
        RETURNING id INTO v_modulo_id;

        INSERT INTO videos (modulo_id, titulo, descripcion, youtube_url, youtube_id, duracion_segundos, orden, estado)
        VALUES (v_modulo_id, 'Taller Completo: Auriculoterapia en Sistema Nervioso', 'Grabación completa de la ponencia práctica del Día de la Acupuntura.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 5400, 1, TRUE);
    END IF;

    -- =========================================================================
    -- 2. Taller de Chi Kung
    -- =========================================================================
    IF NOT EXISTS (SELECT 1 FROM cursos WHERE nombre = 'Taller de Chi Kung') THEN
        INSERT INTO cursos (nombre, descripcion, imagen_portada, docente_id, estado)
        VALUES (
            'Taller de Chi Kung',
            'Ejercicios bioenergéticos, posturas y respiración para el cultivo del Qi, regulación del flujo de los meridianos y equilibrio de la energía vital.',
            'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
            v_docente_id,
            TRUE
        ) RETURNING id INTO v_curso_id;

        INSERT INTO modulos (curso_id, nombre, descripcion, orden, estado)
        VALUES (v_curso_id, 'Sesión Práctica: Ejercicios y Respiración Chi Kung', 'Secuencias de movimiento y circulación del Qi para la salud integral.', 1, TRUE)
        RETURNING id INTO v_modulo_id;

        INSERT INTO videos (modulo_id, titulo, descripcion, youtube_url, youtube_id, duracion_segundos, orden, estado)
        VALUES (v_modulo_id, 'Práctica Guiada: Chi Kung Terapéutico', 'Sesión guiada de movimiento y armonización energética.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 4800, 1, TRUE);
    END IF;

    -- =========================================================================
    -- 3. Reflexología en Sistema Nervioso y Sistema Inmune
    -- =========================================================================
    IF NOT EXISTS (SELECT 1 FROM cursos WHERE nombre = 'Reflexología en Sistema Nervioso y Sistema Inmune') THEN
        INSERT INTO cursos (nombre, descripcion, imagen_portada, docente_id, estado)
        VALUES (
            'Reflexología en Sistema Nervioso y Sistema Inmune',
            'Técnicas de estimulación en zonas reflejas para modular la respuesta neuroinmunológica, fortalecer defensas y reducir el impacto del estrés crónico.',
            'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80',
            v_docente_id,
            TRUE
        ) RETURNING id INTO v_curso_id;

        INSERT INTO modulos (curso_id, nombre, descripcion, orden, estado)
        VALUES (v_curso_id, 'Sesión Magistral: Reflexología Neuroinmune', 'Topografía refleja, técnica de presión y protocolo de estimulación inmune.', 1, TRUE)
        RETURNING id INTO v_modulo_id;

        INSERT INTO videos (modulo_id, titulo, descripcion, youtube_url, youtube_id, duracion_segundos, orden, estado)
        VALUES (v_modulo_id, 'Protocolo de Reflexología para el Sistema Inmune', 'Demostración clínica paso a paso sobre puntos y zonas reflejas.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 5100, 1, TRUE);
    END IF;

    -- =========================================================================
    -- 4. La Importancia de la Dietética en Trastornos Metabólicos
    -- =========================================================================
    IF NOT EXISTS (SELECT 1 FROM cursos WHERE nombre = 'La Importancia de la Dietética en Trastornos Metabólicos') THEN
        INSERT INTO cursos (nombre, descripcion, imagen_portada, docente_id, estado)
        VALUES (
            'La Importancia de la Dietética en Trastornos Metabólicos',
            'Nutrición y dietoterapia según la Medicina Tradicional China y la visión integrativa para el manejo de resistencia a la insulina, dislipidemias y síndrome metabólico.',
            'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
            v_docente_id,
            TRUE
        ) RETURNING id INTO v_curso_id;

        INSERT INTO modulos (curso_id, nombre, descripcion, orden, estado)
        VALUES (v_curso_id, 'Sesión Magistral: Dietoterapia y Metabolismo', 'Naturaleza y sabor de los alimentos, trofología y pautas terapéuticas.', 1, TRUE)
        RETURNING id INTO v_modulo_id;

        INSERT INTO videos (modulo_id, titulo, descripcion, youtube_url, youtube_id, duracion_segundos, orden, estado)
        VALUES (v_modulo_id, 'Estrategias Dietéticas en Síndrome Metabólico', 'Clase magistral sobre alimentos terapéuticos y planes de alimentación.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 5400, 1, TRUE);
    END IF;

    -- =========================================================================
    -- 5. El Abordaje del Dolor con Terapia Manual y Acupuntura
    -- =========================================================================
    IF NOT EXISTS (SELECT 1 FROM cursos WHERE nombre = 'El Abordaje del Dolor con Terapia Manual y Acupuntura') THEN
        INSERT INTO cursos (nombre, descripcion, imagen_portada, docente_id, estado)
        VALUES (
            'El Abordaje del Dolor con Terapia Manual y Acupuntura',
            'Sinergia terapéutica entre técnicas miofasciales, manipulación articular y puntos acupunturales analgésicos para el tratamiento del dolor agudo y crónico.',
            'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
            v_docente_id,
            TRUE
        ) RETURNING id INTO v_curso_id;

        INSERT INTO modulos (curso_id, nombre, descripcion, orden, estado)
        VALUES (v_curso_id, 'Sesión Magistral: Manejo Integral del Dolor', 'Diagnóstico diferencial de dolor, cadenas musculares y puntos Ashi/distales.', 1, TRUE)
        RETURNING id INTO v_modulo_id;

        INSERT INTO videos (modulo_id, titulo, descripcion, youtube_url, youtube_id, duracion_segundos, orden, estado)
        VALUES (v_modulo_id, 'Técnicas Combinadas de Terapia Manual y Agujas', 'Demostración de punción y liberación miofascial en dolor articular/muscular.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 5700, 1, TRUE);
    END IF;

    -- =========================================================================
    -- 6. Abordaje de Parálisis Facial con Terapia Manual y Acupuntura
    -- =========================================================================
    IF NOT EXISTS (SELECT 1 FROM cursos WHERE nombre = 'Abordaje de Parálisis Facial con Terapia Manual y Acupuntura') THEN
        INSERT INTO cursos (nombre, descripcion, imagen_portada, docente_id, estado)
        VALUES (
            'Abordaje de Parálisis Facial con Terapia Manual y Acupuntura',
            'Protocolo de rehabilitación neurológica y neuromuscular para parálisis de Bell y alteraciones faciales mediante masaje terapéutico, moxibustión y electroacupuntura.',
            'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
            v_docente_id,
            TRUE
        ) RETURNING id INTO v_curso_id;

        INSERT INTO modulos (curso_id, nombre, descripcion, orden, estado)
        VALUES (v_curso_id, 'Sesión Magistral: Rehabilitación en Parálisis Facial', 'Evaluación del VII par craneal, estadios de la parálisis y protocolo de punción.', 1, TRUE)
        RETURNING id INTO v_modulo_id;

        INSERT INTO videos (modulo_id, titulo, descripcion, youtube_url, youtube_id, duracion_segundos, orden, estado)
        VALUES (v_modulo_id, 'Protocolo Clínico en Parálisis de Bell', 'Demostración práctica de tratamiento neuromuscular facial.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 5400, 1, TRUE);
    END IF;

    RAISE NOTICE 'Semilla del Día de la Acupuntura ejecutada con éxito.';
END $$;
