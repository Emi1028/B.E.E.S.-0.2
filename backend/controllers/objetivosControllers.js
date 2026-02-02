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