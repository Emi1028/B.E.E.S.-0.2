const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
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
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // cambiar a true en producción con HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 horas
    }
}));

// Rutas de autenticación
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
            nombre,
            apellido: apellidoCompleto,
            telefono
        };
        
        // Crear sesión
        req.session.userId = nuevoUsuario.id;
        req.session.usuario = nuevoUsuario;
        
        res.json({ success: true, message: 'Registro exitoso', usuario: req.session.usuario });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

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

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
        }
        res.json({ success: true, message: 'Sesión cerrada' });
    });
});

app.get('/api/session', (req, res) => {
    if (req.session.userId) {
        res.json({ 
            success: true, 
            autenticado: true, 
            usuario: req.session.usuario 
        });
    } else {
        res.json({ 
            success: true, 
            autenticado: false 
        });
    }
});

// Middleware de protección de rutas
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    next();
}

// Ejemplo de ruta protegida
app.get('/api/perfil', requireAuth, (req, res) => {
    res.json({ success: true, usuario: req.session.usuario });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
