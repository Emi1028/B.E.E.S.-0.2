const pool = require('../db/connection');

// Registrar día completado
exports.registrarDiaCompletado = async (req, res) => {
    const { id_niño, fecha } = req.body;
    
    if (!id_niño || !fecha) {
        return res.status(400).json({ success: false, message: 'Datos incompletos' });
    }
    
    try {
        await pool.query(
            `INSERT INTO racha_diaria (id_niño, fecha, completado) 
             VALUES (?, ?, 1) 
             ON DUPLICATE KEY UPDATE completado = 1`,
            [id_niño, fecha]
        );
        
        res.json({ success: true, message: 'Día registrado' });
    } catch (error) {
        console.error('Error registrando día:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

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
        
        console.log('📅 Consultando días completados:', { id_nino, año: añoActual, mes: mesActual, primerDia, ultimoDia });
        
        const [dias] = await pool.query(
            `SELECT fecha, completado FROM racha_diaria 
             WHERE id_niño = ? 
             AND fecha BETWEEN ? AND ?`,
            [id_nino, primerDia, ultimoDia]
        );
        
        console.log('🗂️ Todos los registros del mes:', dias);
        
        // Filtrar solo los completados
        const diasCompletados = dias.filter(d => d.completado === 1);
        console.log('✅ Días completados:', diasCompletados.length, diasCompletados.map(d => d.fecha));
        
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
        
        const hoy = new Date().toISOString().split('T')[0];
        
        if (objetivos[0].total > 0 && objetivos[0].total === objetivos[0].completados) {
            // Todos completados - registrar día
            await pool.query(
                `INSERT INTO racha_diaria (id_niño, fecha, completado) 
                 VALUES (?, ?, 1) 
                 ON DUPLICATE KEY UPDATE completado = 1`,
                [id_nino, hoy]
            );
            res.json({ success: true, diaCompletado: true });
        } else {
            // No todos completados - marcar como no completado
            await pool.query(
                `INSERT INTO racha_diaria (id_niño, fecha, completado) 
                 VALUES (?, ?, 0) 
                 ON DUPLICATE KEY UPDATE completado = 0`,
                [id_nino, hoy]
            );
            res.json({ success: true, diaCompletado: false });
        }
    } catch (error) {
        console.error('Error verificando racha:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};
