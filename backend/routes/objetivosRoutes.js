const express = require('express');
const router = express.Router();
const objetivos = require('../controllers/objetivosControllers');
const racha = require('../controllers/rachaController');
const requireAuth = require('../middleware/requireAuth');

router.post('/CrearObjetivo', requireAuth, objetivos.crearObjetivos);
router.get('/ObtenerObjetivos/:id_nino', requireAuth, objetivos.obtenerObjetivos);
router.delete('/EliminarObjetivo/:id_objetivo', requireAuth, objetivos.eliminarObjetivo);
router.patch('/CompletarObjetivo/:id_objetivo', requireAuth, objetivos.toggleCompletarObjetivo);
router.get('/ObtenerRacha/:id_nino', requireAuth, objetivos.obtenerRacha);

// Rutas de racha con base de datos
router.get('/ObtenerDiasCompletados/:id_nino', requireAuth, racha.obtenerDiasCompletados);
router.get('/CalcularRacha/:id_nino', requireAuth, racha.calcularRacha);
router.post('/VerificarRachaDiaria/:id_nino', requireAuth, racha.verificarYActualizarRachaDiaria);

module.exports = router;
