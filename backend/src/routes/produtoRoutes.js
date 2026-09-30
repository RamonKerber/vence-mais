const express = require('express');
const autenticar = require('../middlewares/authMiddleware');
const produtoController = require('../controllers/produtoController');

const router = express.Router();

router.use(autenticar);

router.get('/', produtoController.listar);
router.post('/', produtoController.criar);
router.put('/:id', produtoController.atualizar);
router.delete('/:id', produtoController.remover);

module.exports = router;