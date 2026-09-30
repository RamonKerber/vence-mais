const express = require('express');
const autenticar = require('../middlewares/authMiddleware');
const descarteController = require('../controllers/descarteController');

const router = express.Router();

router.use(autenticar);

router.post('/', descarteController.registrar);
router.get('/', descarteController.listar);

module.exports = router;