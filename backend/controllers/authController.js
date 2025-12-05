const bcrypt = require('bcrypt');
const pool = require('../db/connection');

// Registro
exports.registro = async (req, res) => {
    const { u_nombre, nombre, apellido_p, apellido_m, telefono, contraseña } = req.body;

    try {
        const apellidoCompleto = `${apellido_p} ${apellido_m}`;

        const [rowsNombre] = await pool.query(
            'SELECT * FROM c_papa WHERE u_nombre = ?',
            [u_nombre]
        );
        if (rowsNombre.length > 0) {
            return res.status(400).json({ success: false, message: 'El nombre de usuario ya está registrado' });
        }

        const [rowsTelefono] = await pool.query(
            'SELECT * FROM c_papa WHERE telefono = ?',
            [telefono]
        );
        if (rowsTelefono.length > 0) {
            return res.status(400).json({ success: false, message: 'El número de teléfono ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(contraseña, 10);

        const [result] = await pool.query(
            'INSERT INTO c_papa (u_nombre, nombre, apellido, telefono, password) VALUES (?, ?, ?, ?, ?)',
            [u_nombre, nombre, apellidoCompleto, telefono, hashedPassword]
        );

        req.session.userId = result.insertId;
        req.session.usuario = {
            id: result.insertId,
            u_nombre,
            nombre,
            apellido: apellidoCompleto,
            telefono
        };

        req.session.save(() => {
            return res.json({ success: true, message: 'Registro exitoso', usuario: req.session.usuario });
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

// Login
exports.login = async (req, res) => {
    const { u_nombre, contraseña } = req.body;

    try {
        const [rows] = await pool.query(
            'SELECT * FROM c_papa WHERE u_nombre = ?',
            [u_nombre]
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }

        const usuario = rows[0];

        const valid = await bcrypt.compare(contraseña, usuario.password);
        if (!valid) {
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }

        req.session.userId = usuario.id_papa;
        req.session.usuario = {
            id: usuario.id_papa,
            u_nombre: usuario.u_nombre,
            telefono: usuario.telefono
        };

        res.json({ success: true, message: 'Inicio de sesión exitoso', usuario: req.session.usuario });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

// Logout
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true, message: 'Sesión cerrada' });
    });
};

// Verificar sesión
exports.session = (req, res) => {
    res.json({
        success: true,
        autenticado: true,
        usuario: req.session.usuario
    });
};
