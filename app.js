const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de la base de datos
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Configuración de middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de sesiones
const sessionStore = new MySQLStore({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    expiration: 1000 * 60 * 60 * 24, // 24 horas real
    clearExpired: true,
    checkExpirationInterval: 1000 * 60 // limpia cada 1 min
});

app.use(session({
    key: 'session_cookie_id',
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: false, // o true si quieres renovar con cada request
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 horas
    }
}));
// Rutas de autenticación
// Ruta de registro
app.post('/api/registro', async (req, res) => {
    const { u_nombre, nombre, apellido_p, apellido_m, telefono, contraseña } = req.body;
    
    try {
        // Concatenar apellidos completos
        const apellidoCompleto = `${apellido_p} ${apellido_m}`;
        
        // Validar que el nombre de usuario no exista
        const [rowsNombre] = await pool.query(
            'SELECT * FROM c_papa WHERE u_nombre = ?',
            [u_nombre]
        );
        if (rowsNombre.length > 0) {
            return res.status(400).json({ success: false, message: 'El nombre de usuario ya está registrado' });
        }
        
        // Validar que el teléfono no exista
        const [rowsTelefono] = await pool.query(
            'SELECT * FROM c_papa WHERE telefono = ?',
            [telefono]
        );
        if (rowsTelefono.length > 0) {
            return res.status(400).json({ success: false, message: 'El número de teléfono ya está registrado' });
        }
        
        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        
        // Insertar nuevo usuario con fecha de registro
        const [result] = await pool.query(
            'INSERT INTO c_papa (u_nombre, nombre, apellido, telefono, password) VALUES (?, ?, ?, ?, ?)',
            [u_nombre,nombre, apellidoCompleto, telefono, hashedPassword]
        );
        //Abrir sesión despues del registro
        const nuevoUsuario = {
            id: result.insertId,
            u_nombre : u_nombre ,
            nombre:nombre,
            apellido: apellidoCompleto,
            telefono:telefono
        };

        
        // Crear sesión
        req.session.userId = nuevoUsuario.id;
        req.session.usuario = nuevoUsuario;

        req.session.save((err) => {
            if (err) {
                console.error("Error guardando sesión:", err);
                return res.status(500).json({ success: false, message: 'Error en el servidor (sesión)' });
            }

            return res.json({
                success: true,
                message: 'Registro exitoso',
                usuario: req.session.usuario
            });
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});
// Ruta de login
app.post('/api/login', async (req, res) => {
    const { u_nombre, contraseña } = req.body;
    try {
        // Buscar usuario
        const [rows] = await pool.query(
            'SELECT * FROM c_papa WHERE u_nombre = ?',
            [u_nombre]
        );        
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
        const usuario = rows[0];
        
        // Verificar contraseña
        const passwordMatch = await bcrypt.compare(contraseña, usuario.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
        
        // Crear sesión
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
});
// Ruta de cerrar sesión
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
        }
        res.json({ success: true, message: 'Sesión cerrada' });
    });
});
// Ruta para verificar sesión
app.get('/api/session', requireAuth, (req, res) => {
    res.json({
        success: true,
        autenticado: true,
        usuario: req.session.usuario
    });
});

// Middleware de protección de rutas
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    next();
}

app.post('/api/CrearPerfil', requireAuth, async (req, res) => {
    const { n_nombre } = req.body;
    const userId = req.session.userId;
    try {
        // Insertar nuevo perfil de niño asociado al usuario padre
        const [result] = await pool.query(
            'INSERT INTO prueba_niños (n_nombre, id_papa) VALUES (?, ?)',
            [n_nombre, userId]
        );
        if (result.length === 3) {
            return res.status(500).json({ success: false, message: 'maximos perfiles creados' });
        }
        return res.json({ success: true, message: 'Perfil creado exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Error al crear perfil de niño:', error);
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }      
});
app.get('/api/ObtenerNiños', requireAuth, async (req, res) => {
    const userId = req.session.userId;
    try {
        // Obtener perfiles de niños asociados al usuario padre
        const [rows] = await pool.query(
            'SELECT id_niño, n_nombre FROM prueba_niños WHERE id_papa = ?',
            [userId]
        );
        if (rows.length === 0) {
            return res.json({ success: true, message: 'No hay perfiles de niños asociados', niños: [] });
        }
        return res.json({ success: true, niños: rows });
    }catch (err){
        console.error('Error al obtener perfiles de niños:', err);
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
