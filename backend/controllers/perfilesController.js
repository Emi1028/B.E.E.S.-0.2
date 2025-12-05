const pool = require('../db/connection');

exports.crearPerfil = async (req, res) => {
    const { n_nombre } = req.body;
    const userId = req.session.userId;

    try {
        const [result] = await pool.query(
            'INSERT INTO prueba_niños (n_nombre, id_papa) VALUES (?, ?)',
            [n_nombre, userId]
        );

        return res.json({
            success: true,
            message: 'Perfil creado exitosamente',
            id: result.insertId
        });

    } catch (error) {
        console.error('Error al crear perfil:', error);
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

exports.obtenerPerfiles = async (req, res) => {
    const userId = req.session.userId;

    try {
        const [rows] = await pool.query(
            'SELECT * FROM prueba_niños WHERE id_papa = ?',
            [userId]
        );

        res.json({ success: true, niños: rows });

    } catch (error) {
        console.error('Error obteniendo niños:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};
