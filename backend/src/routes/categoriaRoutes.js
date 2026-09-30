const express = require('express');
const autenticar = require('../middlewares/authMiddleware');
const categoriaController = require('../controllers/categoriaController');

const router = express.Router();

router.use(autenticar);

router.get('/', categoriaController.listar);
router.post('/', categoriaController.criar);
router.put('/:id', categoriaController.atualizar);
router.delete('/:id', categoriaController.remover);

module.exports = router;