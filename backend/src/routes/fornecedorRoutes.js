const express = require('express');
const autenticar = require('../middlewares/authMiddleware');
const fornecedorController = require('../controllers/fornecedorController');

const router = express.Router();

router.use(autenticar);

router.get('/', fornecedorController.listar);
router.post('/', fornecedorController.criar);
router.put('/:id', fornecedorController.atualizar);
router.delete('/:id', fornecedorController.remover);

module.exports = router;