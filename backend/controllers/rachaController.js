const pool = require('../db/connection');

// Obtener días completados de un mes específico
exports.obtenerDiasCompletados = async (req, res) => {
    const { id_nino } = req.params;
    const { año, mes } = req.query; // mes: 0-11 (JavaScript format)
    
    if (!año || mes === undefined) {
        return res.status(400).json({ success: false, message: 'Faltan parámetros año o mes' });
    }
    
    try {
        // Calcular rango del mes
        const mesActual = parseInt(mes);
        const añoActual = parseInt(año);
        const primerDia = `${añoActual}-${String(mesActual + 1).padStart(2, '0')}-01`;
        // Calcular el último día real del mes
        const ultimoDiaDelMes = new Date(añoActual, mesActual + 1, 0).getDate();
        const ultimoDia = `${añoActual}-${String(mesActual + 1).padStart(2, '0')}-${ultimoDiaDelMes}`;
        
        const [dias] = await pool.query(
            `SELECT fecha, completado FROM racha_diaria 
             WHERE id_niño = ? 
             AND fecha BETWEEN ? AND ?`,
            [id_nino, primerDia, ultimoDia]
        );
        
        // Filtrar solo los completados
        const diasCompletados = dias.filter(d => d.completado === 1);
        
        res.json({ 
            success: true, 
            dias: diasCompletados.map(d => d.fecha.toISOString().split('T')[0])
        });
    } catch (error) {
        console.error('Error obteniendo días:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

// Calcular racha actual
exports.calcularRacha = async (req, res) => {
    const { id_nino } = req.params;
    
    try {
        // Obtener todos los días completados ordenados
        const [dias] = await pool.query(
            `SELECT fecha FROM racha_diaria 
             WHERE id_niño = ? AND completado = 1 
             ORDER BY fecha DESC`,
            [id_nino]
        );
        
        if (dias.length === 0) {
            return res.json({ success: true, racha: 0, total: 0 });
        }
        
        // Calcular racha consecutiva desde hoy
        let racha = 0;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        for (const row of dias) {
            const fecha = new Date(row.fecha);
            fecha.setHours(0, 0, 0, 0);
            
            const diffDias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
            
            if (diffDias === racha) {
                racha++;
            } else {
                break;
            }
        }
        
        res.json({ 
            success: true, 
            racha,
            total: dias.length
        });
    } catch (error) {
        console.error('Error calculando racha:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

// Verificar y actualizar racha del día actual
exports.verificarYActualizarRachaDiaria = async (req, res) => {
    const { id_nino } = req.params;
    
    try {
        // Verificar si todos los objetivos están completados
        const [objetivos] = await pool.query(
            `SELECT COUNT(*) as total, 
                    SUM(CASE WHEN completado = 1 THEN 1 ELSE 0 END) as completados
             FROM objetivos 
             WHERE id_niño = ?`,
            [id_nino]
        );
        
        // Usar fecha local
        const ahora = new Date();
        const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
        
        const total = parseInt(objetivos[0].total);
        const completados = parseInt(objetivos[0].completados);
        
        const completadoHoy = total > 0 && total === completados ? 1 : 0;
        
        await pool.query(
            `INSERT INTO racha_diaria (id_niño, fecha, completado) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE completado = ?`,
            [id_nino, hoy, completadoHoy, completadoHoy]
        );
        
        res.json({ success: true, diaCompletado: completadoHoy === 1 });
    } catch (error) {
        console.error('Error verificando racha:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};
