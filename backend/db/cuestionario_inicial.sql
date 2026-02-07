-- =====================================================
-- AGREGAR COLUMNAS DE CUESTIONARIO A TABLA EXISTENTE
-- =====================================================

-- Agregar columnas del cuestionario a prueba_niños
ALTER TABLE prueba_niños
ADD COLUMN q1 TINYINT DEFAULT 0 COMMENT 'Se hiere emocionalmente con facilidad (0-3)',
ADD COLUMN q2 TINYINT DEFAULT 0 COMMENT 'Es abusivo con los demás (0-3)',
ADD COLUMN q3 TINYINT DEFAULT 0 COMMENT 'Se frustra con facilidad ante los esfuerzos (0-3)',
ADD COLUMN q4 TINYINT DEFAULT 0 COMMENT 'Tiene problemas de sueño (0-3)';

-- =====================================================
-- NOTAS
-- =====================================================
-- Valores: 0=Nunca, 1=Sólo un poco, 2=Bastante, 3=Mucho
-- Puntuación total: 0-12 puntos
-- =====================================================
