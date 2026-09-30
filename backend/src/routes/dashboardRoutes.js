const express = require('express');
const autenticar = require('../middlewares/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.use(autenticar);

router.get('/', dashboardController.resumo);

module.exports = router;