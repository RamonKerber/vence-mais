const express = require('express');
const autenticar = require('../middlewares/authMiddleware');
const alertaController = require('../controllers/alertaController');

const router = express.Router();

router.use(autenticar);

router.get('/', alertaController.listarAlertas);
router.get('/riscos', alertaController.listarRiscos);

module.exports = router;