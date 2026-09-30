const express = require('express');
const autenticar = require('../middlewares/authMiddleware');
const loteController = require('../controllers/loteController');

const router = express.Router();

router.use(autenticar);

router.get('/', loteController.listar);
router.post('/', loteController.criar);
router.put('/:id', loteController.atualizar);
router.delete('/:id', loteController.remover);

module.exports = router;