const pool = require('../db/connection');
// Crear un nuevo perfil de niño
exports.crearPerfil = async (req, res) => {
    const { n_nombre } = req.body;
    const userId = req.session.userId;

    try {
        const [result] = await pool.query(
            'INSERT INTO nino (n_nombre, id_papa) VALUES (?, ?)',
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
// Obtener todos los perfiles de niños asociados al usuario autenticado
exports.obtenerPerfiles = async (req, res) => {
    const userId = req.session.userId;

    try {
        const [rows] = await pool.query(
            'SELECT * FROM ninos WHERE id_papa = ?',
            [userId]
        );

        res.json({ success: true, niños: rows });

    } catch (error) {
        console.error('Error obteniendo niños:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};
// Eliminar un perfil de niño por ID
exports.eliminarPerfil = async (req, res) => {
    try{
        const perfilId = req.params.id;
        const [result] = await pool.query(
            'DELETE FROM nino WHERE id_niño = ?',
            [perfilId]
        );
        if (result.affectedRows === 0) {
            return res.json({
                success: false,
                message: "Perfil no encontrado"
            });
        }
        return res.json({
            success: true,
            message: 'Perfil eliminado exitosamente'
        });
    }catch(error){
        console.error('Error al eliminar perfil:', error);
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
}
