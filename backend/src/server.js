require('dotenv').config();

const express = require('express');
const cors = require('cors');
const autenticar = require('./middlewares/authMiddleware');
const categoriaRoutes = require('./routes/categoriaRoutes');
const fornecedorRoutes = require('./routes/fornecedorRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const loteRoutes = require('./routes/loteRoutes');
const alertaRoutes = require('./routes/alertaRoutes');
const descarteRoutes = require('./routes/descarteRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');
const movimentacaoRoutes = require('./routes/movimentacaoRoutes');

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'API Vence+ funcionando!'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

app.get('/protegida', autenticar, (req, res) => {
  res.json({
    mensagem: 'Acesso autorizado!',
    usuario: req.usuario
  });
});

app.use('/categorias', categoriaRoutes);

app.use('/fornecedores', fornecedorRoutes);

app.use('/produtos', produtoRoutes);

app.use('/lotes', loteRoutes);

app.use('/alertas', alertaRoutes);

app.use('/descartes', descarteRoutes);

app.use('/dashboard', dashboardRoutes);

app.use('/relatorios', relatorioRoutes);

app.use('/movimentacoes', movimentacaoRoutes);