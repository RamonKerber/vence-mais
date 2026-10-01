const express = require('express');
const autenticar = require('../middlewares/authMiddleware');
const movimentacaoController = require('../controllers/movimentacaoController');

const router = express.Router();

router.use(autenticar);

router.post('/', movimentacaoController.registrar);
router.get('/', movimentacaoController.listar);

module.exports = router;