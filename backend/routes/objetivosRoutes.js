const express = require('express');
const router = express.Router();
const objetivos = require('../controllers/objetivosControllers');
const requireAuth = require('../middleware/requireAuth');

router.post('/CrearObjetivo', requireAuth, objetivos.crearObjetivos);
router.get('/ObtenerObjetivos/:id_nino', requireAuth, objetivos.obtenerObjetivos);
router.delete('/EliminarObjetivo/:id_objetivo', requireAuth, objetivos.eliminarObjetivo);

module.exports = router;
