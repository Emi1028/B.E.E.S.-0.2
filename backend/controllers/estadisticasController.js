const pool = require('../db/connection');

exports.obtenerEstadisticas = async (req, res) => {
    const { id_nino } = req.params;
    
    try {
        const [juegos] = await pool.query(
            'SELECT juego as nombre_juego, puntaje FROM puntajemax_juego WHERE id_nino = ?',
            [id_nino]
        );
        
        res.json(juegos);
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
    }
};