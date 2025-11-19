const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuración de middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de sesiones
app.use(session({
    secret: 'tu-secreto-seguro-cambialo-en-produccion',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // cambiar a true en producción con HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 horas
    }
}));

// Base de datos simulada (en producción usar una BD real)
const usuarios = [];

// Rutas de autenticación
app.post('/api/registro', (req, res) => {
    const { nombre, apellido_p, apellido_m, telefono, contraseña } = req.body;
    
    // Validar que el usuario no exista
    const usuarioExiste = usuarios.find(u => u.nombre === nombre && u.telefono === telefono);
    if (usuarioExiste) {
        return res.status(400).json({ success: false, message: 'El usuario ya existe' });
    }
    
    // Crear nuevo usuario
    const nuevoUsuario = {
        id: usuarios.length + 1,
        nombre,
        apellido_p,
        apellido_m,
        telefono,
        contraseña // En producción, NUNCA guardar contraseñas en texto plano, usar bcrypt
    };
    
    usuarios.push(nuevoUsuario);
    
    // Crear sesión
    req.session.userId = nuevoUsuario.id;
    req.session.usuario = {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellido_p: nuevoUsuario.apellido_p,
        apellido_m: nuevoUsuario.apellido_m,
        telefono: nuevoUsuario.telefono
    };
    
    res.json({ success: true, message: 'Registro exitoso', usuario: req.session.usuario });
});

app.post('/api/login', (req, res) => {
    const { nombre, contraseña } = req.body;
    
    // Buscar usuario
    const usuario = usuarios.find(u => u.nombre === nombre && u.contraseña === contraseña);
    
    if (!usuario) {
        return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
    
    // Crear sesión
    req.session.userId = usuario.id;
    req.session.usuario = {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido_p: usuario.apellido_p,
        apellido_m: usuario.apellido_m,
        telefono: usuario.telefono
    };
    
    res.json({ success: true, message: 'Inicio de sesión exitoso', usuario: req.session.usuario });
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
