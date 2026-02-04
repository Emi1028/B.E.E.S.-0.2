const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');

// cargar .env desde raíz
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Config sesión
const sessionStore = new MySQLStore({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    expiration: 1000 * 60 * 60 * 24,
    clearExpired: true,
    checkExpirationInterval: 1000 * 60,
});

app.use(session({
    key: 'session_cookie_id',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
}));

// Rutas
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/perfilRoutes'));
app.use('/api', require('./routes/objetivosRoutes'));
app.use('/api', require('./routes/estadisticasRoutes'));

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
