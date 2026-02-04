const express = require('express');
const router = express.Router();
const estadisticas = require('../controllers/estadisticasController');
const requireAuth = require('../middleware/requireAuth');

router.get('/estadisticas-juegos/:id_nino', requireAuth, estadisticas.obtenerEstadisticas);

module.exports = router;
