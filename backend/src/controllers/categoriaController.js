const pool = require('../config/database');

async function listar(req, res) {
  try {
    const resultado = await pool.query(
      'SELECT * FROM categorias ORDER BY nome'
    );

    return res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: 'Erro ao listar categorias.' });
  }
}

async function criar(req, res) {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ mensagem: 'Nome é obrigatório.' });
    }

    const resultado = await pool.query(
      `INSERT INTO categorias (nome, descricao)
       VALUES ($1, $2)
       RETURNING *`,
      [nome, descricao]
    );

    return res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    if (erro.code === '23505') {
      return res.status(409).json({ mensagem: 'Categoria já cadastrada.' });
    }

    return res.status(500).json({ mensagem: 'Erro ao cadastrar categoria.' });
  }
}

async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;

    const resultado = await pool.query(
      `UPDATE categorias
       SET nome = $1, descricao = $2
       WHERE id_categoria = $3
       RETURNING *`,
      [nome, descricao, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Categoria não encontrada.' });
    }

    return res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: 'Erro ao atualizar categoria.' });
  }
}

async function remover(req, res) {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM categorias
       WHERE id_categoria = $1
       RETURNING *`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Categoria não encontrada.' });
    }

    return res.json({ mensagem: 'Categoria removida com sucesso.' });
  } catch (erro) {
    console.error(erro);

    if (erro.code === '23503') {
      return res.status(409).json({
        mensagem: 'Categoria vinculada a produtos não pode ser excluída.'
      });
    }

    return res.status(500).json({ mensagem: 'Erro ao remover categoria.' });
  }
}

module.exports = {
  listar,
  criar,
  atualizar,
  remover
};