const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');

router.post('/registro', auth.registro);
router.post('/login', auth.login);
router.post('/logout', auth.logout);
router.get('/session', requireAuth, auth.session);

module.exports = router;
