const express = require('express');
const router = express.Router();
const perfil = require('../controllers/perfilesController');
const requireAuth = require('../middleware/requireAuth');

router.post('/CrearPerfil', requireAuth, perfil.crearPerfil);
router.get('/ObtenerNinos', requireAuth, perfil.obtenerPerfiles);

module.exports = router;
