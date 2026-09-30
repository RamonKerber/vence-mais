const express = require('express');
const autenticar = require('../middlewares/authMiddleware');
const relatorioController = require('../controllers/relatorioController');

const router = express.Router();

router.use(autenticar);

router.get('/perdas', relatorioController.relatorioPerdas);
router.get('/validade', relatorioController.relatorioValidade);

module.exports = router;