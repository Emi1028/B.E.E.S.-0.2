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
        const [result] = await pool.query(
            'DELETE FROM objetivos WHERE id_objetivo = ?',
            [id_objetivo]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Objetivo no encontrado' });
        }
        
        res.json({ success: true, message: 'Objetivo eliminado' });
    } catch (error) {
        console.error('Error al eliminar objetivo:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar objetivo' });
    }
};