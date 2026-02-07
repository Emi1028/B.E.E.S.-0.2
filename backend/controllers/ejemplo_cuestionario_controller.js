// =====================================================
// EJEMPLO DE IMPLEMENTACIÓN EN perfilesController.js
// =====================================================

// Agregar esta función al archivo perfilesController.js

exports.crearPerfilConCuestionario = async (req, res) => {
    const { n_nombre, q1, q2, q3, q4 } = req.body;
    const userId = req.session.userId;

    // Iniciar transacción para asegurar consistencia de datos
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // 1. Crear el perfil del niño
        const [resultPerfil] = await connection.query(
            'INSERT INTO prueba_niños (n_nombre, id_papa) VALUES (?, ?)',
            [n_nombre, userId]
        );

        const niñoId = resultPerfil.insertId;

        // 2. Guardar el cuestionario inicial
        await connection.query(
            `INSERT INTO cuestionario_inicial 
            (id_niño, pregunta_1, pregunta_2, pregunta_3, pregunta_4) 
            VALUES (?, ?, ?, ?, ?)`,
            [niñoId, q1, q2, q3, q4]
        );

        // Confirmar transacción
        await connection.commit();

        return res.json({
            success: true,
            message: 'Perfil y cuestionario creados exitosamente',
            id: niñoId
        });

    } catch (error) {
        // Revertir cambios si hay error
        await connection.rollback();
        console.error('Error al crear perfil con cuestionario:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor al crear el perfil' 
        });
    } finally {
        connection.release();
    }
};

// =====================================================
// FUNCIÓN PARA OBTENER CUESTIONARIO DE UN NIÑO
// =====================================================

exports.obtenerCuestionario = async (req, res) => {
    const userId = req.session.userId;
    const niñoId = req.params.id;

    try {
        // Verificar que el niño pertenece al usuario autenticado
        const [niño] = await pool.query(
            'SELECT * FROM prueba_niños WHERE id_niño = ? AND id_papa = ?',
            [niñoId, userId]
        );

        if (niño.length === 0) {
            return res.json({ success: false, message: 'Niño no encontrado' });
        }

        // Obtener el cuestionario más reciente
        const [cuestionario] = await pool.query(
            `SELECT * FROM cuestionario_inicial 
            WHERE id_niño = ? 
            ORDER BY fecha_registro DESC 
            LIMIT 1`,
            [niñoId]
        );

        res.json({ 
            success: true, 
            cuestionario: cuestionario[0] || null 
        });

    } catch (error) {
        console.error('Error obteniendo cuestionario:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

// =====================================================
// FUNCIÓN PARA OBTENER ESTADÍSTICAS DEL CUESTIONARIO
// =====================================================

exports.obtenerEstadisticasCuestionario = async (req, res) => {
    const userId = req.session.userId;
    const niñoId = req.params.id;

    try {
        // Verificar que el niño pertenece al usuario autenticado
        const [niño] = await pool.query(
            'SELECT * FROM prueba_niños WHERE id_niño = ? AND id_papa = ?',
            [niñoId, userId]
        );

        if (niño.length === 0) {
            return res.json({ success: false, message: 'Niño no encontrado' });
        }

        // Obtener estadísticas del cuestionario
        const [stats] = await pool.query(
            `SELECT 
                COUNT(*) as total_cuestionarios,
                AVG(pregunta_1) as promedio_emocional,
                AVG(pregunta_2) as promedio_abusivo,
                AVG(pregunta_3) as promedio_frustracion,
                AVG(pregunta_4) as promedio_sueno,
                AVG(pregunta_1 + pregunta_2 + pregunta_3 + pregunta_4) as promedio_total
            FROM cuestionario_inicial 
            WHERE id_niño = ?`,
            [niñoId]
        );

        res.json({ 
            success: true, 
            estadisticas: stats[0] 
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

// =====================================================
// ACTUALIZAR RUTA EN perfilRoutes.js
// =====================================================

// Agregar estas rutas al archivo perfilRoutes.js:
// router.post('/CrearPerfilConCuestionario', requireAuth, perfil.crearPerfilConCuestionario);
// router.get('/ObtenerCuestionario/:id', requireAuth, perfil.obtenerCuestionario);
// router.get('/EstadisticasCuestionario/:id', requireAuth, perfil.obtenerEstadisticasCuestionario);
