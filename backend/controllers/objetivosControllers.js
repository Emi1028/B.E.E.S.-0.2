const pool = require('../db/connection');

// Crear un nuevo objetivo
exports.crearObjetivos = async (req, res) => {
    const { id_niño, texto_objetivo } = req.body;
    
    if (!id_niño || !texto_objetivo) {
        return res.status(400).json({ success: false, message: 'Datos incompletos' });
    }
    
    try {
        const [result] = await pool.query(
            'INSERT INTO objetivos (id_niño, texto_objetivo) VALUES (?, ?)',
            [id_niño, texto_objetivo]
        );
        
        res.status(201).json({ 
            success: true, 
            message: 'Objetivo creado exitosamente', 
            id: result.insertId 
        });
    } catch (error) {
        console.error('Error al crear objetivo:', error);
        res.status(500).json({ success: false, message: 'Error al crear objetivo' });
    }
};

// Obtener objetivos de un niño
exports.obtenerObjetivos = async (req, res) => {
    const { id_nino } = req.params;
    
    try {
        const [objetivos] = await pool.query(
            'SELECT * FROM objetivos WHERE id_niño = ? ORDER BY fecha_creacion DESC',
            [id_nino]
        );
        
        res.json({ success: true, objetivos });
    } catch (error) {
        console.error('Error obteniendo objetivos:', error);
        res.status(500).json({ success: false, message: 'Error al obtener objetivos' });
    }
};

// Eliminar objetivo
exports.eliminarObjetivo = async (req, res) => {
    const { id_objetivo } = req.params;
    
    try {
        // Verificar si el objetivo está completado
        const [objetivo] = await pool.query(
            'SELECT completado FROM objetivos WHERE id_objetivo = ?',
            [id_objetivo]
        );
        
        if (objetivo.length === 0) {
            return res.status(404).json({ success: false, message: 'Objetivo no encontrado' });
        }
        
        if (objetivo[0].completado) {
            return res.status(403).json({ success: false, message: 'No se puede eliminar un objetivo completado' });
        }
        
        const [result] = await pool.query(
            'DELETE FROM objetivos WHERE id_objetivo = ?',
            [id_objetivo]
        );
        
        res.json({ success: true, message: 'Objetivo eliminado' });
    } catch (error) {
        console.error('Error al eliminar objetivo:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar objetivo' });
    }
};

// Marcar/desmarcar objetivo como completado
exports.toggleCompletarObjetivo = async (req, res) => {
    const { id_objetivo } = req.params;
    const { completado } = req.body;
    
    if (completado === undefined) {
        return res.status(400).json({ success: false, message: 'El campo completado es requerido' });
    }
    
    try {
        // Obtener el id del niño antes de actualizar
        const [objetivo] = await pool.query(
            'SELECT id_niño FROM objetivos WHERE id_objetivo = ?',
            [id_objetivo]
        );
        
        if (objetivo.length === 0) {
            return res.status(404).json({ success: false, message: 'Objetivo no encontrado' });
        }
        
        // Actualizar el estado del objetivo
        await pool.query(
            'UPDATE objetivos SET completado = ? WHERE id_objetivo = ?',
            [completado, id_objetivo]
        );
        
        const id_niño = objetivo[0].id_niño;
        
        // Verificar si todos los objetivos están completados para actualizar racha
        const [objetivos] = await pool.query(
            `SELECT COUNT(*) as total, 
                    SUM(CASE WHEN completado = 1 THEN 1 ELSE 0 END) as completados
             FROM objetivos WHERE id_niño = ?`,
            [id_niño]
        );
        
        // Usar fecha local en lugar de UTC
        const ahora = new Date();
        const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
        
        const total = parseInt(objetivos[0].total);
        const completados = parseInt(objetivos[0].completados);
        
        console.log('🎯 Estado objetivos:', { id_niño, total, completados, fecha: hoy });
        
        // Actualizar racha en base de datos
        if (total > 0 && total === completados) {
            console.log('✅ TODOS COMPLETADOS - Marcando día en racha');
            await pool.query(
                `INSERT INTO racha_diaria (id_niño, fecha, completado) 
                 VALUES (?, ?, 1) 
                 ON DUPLICATE KEY UPDATE completado = 1`,
                [id_niño, hoy]
            );
            console.log('💾 Guardado en BD:', { id_niño, fecha: hoy, completado: 1 });
        } else {
            console.log('❌ NO TODOS COMPLETADOS - Desmarcando día');
            await pool.query(
                `INSERT INTO racha_diaria (id_niño, fecha, completado) 
                 VALUES (?, ?, 0) 
                 ON DUPLICATE KEY UPDATE completado = 0`,
                [id_niño, hoy]
            );
        }
        
        res.json({ 
            success: true, 
            message: completado ? 'Objetivo completado' : 'Objetivo desmarcado'
        });
    } catch (error) {
        console.error('Error al actualizar objetivo:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar objetivo' });
    }
};

// Obtener racha y estadísticas del niño
exports.obtenerRacha = async (req, res) => {
    const { id_nino } = req.params;
    
    try {
        // Obtener objetivos del niño con su estado de completado
        const [objetivos] = await pool.query(
            'SELECT id_objetivo, texto_objetivo, completado FROM objetivos WHERE id_niño = ? ORDER BY fecha_creacion ASC LIMIT 3',
            [id_nino]
        );
        
        res.json({ 
            success: true, 
            objetivos,
            message: 'Racha obtenida exitosamente'
        });
    } catch (error) {
        console.error('Error al obtener racha:', error);
        res.status(500).json({ success: false, message: 'Error al obtener racha' });
    }
};