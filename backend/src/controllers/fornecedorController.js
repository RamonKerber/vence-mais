const pool = require('../config/database');

async function listar(req, res) {
  try {
    const resultado = await pool.query(
      'SELECT * FROM fornecedores ORDER BY nome'
    );

    return res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: 'Erro ao listar fornecedores.' });
  }
}

async function criar(req, res) {
  try {
    const { nome, telefone, email } = req.body;

    if (!nome) {
      return res.status(400).json({ mensagem: 'Nome é obrigatório.' });
    }

    const resultado = await pool.query(
      `INSERT INTO fornecedores (nome, telefone, email)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nome, telefone, email]
    );

    return res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: 'Erro ao cadastrar fornecedor.' });
  }
}

async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { nome, telefone, email } = req.body;

    const resultado = await pool.query(
      `UPDATE fornecedores
       SET nome = $1, telefone = $2, email = $3
       WHERE id_fornecedor = $4
       RETURNING *`,
      [nome, telefone, email, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
    }

    return res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: 'Erro ao atualizar fornecedor.' });
  }
}

async function remover(req, res) {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM fornecedores
       WHERE id_fornecedor = $1
       RETURNING *`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
    }

    return res.json({ mensagem: 'Fornecedor removido com sucesso.' });
  } catch (erro) {
    console.error(erro);

    if (erro.code === '23503') {
      return res.status(409).json({
        mensagem: 'Fornecedor vinculado a produtos não pode ser excluído.'
      });
    }

    return res.status(500).json({ mensagem: 'Erro ao remover fornecedor.' });
  }
}

module.exports = {
  listar,
  criar,
  atualizar,
  remover
};