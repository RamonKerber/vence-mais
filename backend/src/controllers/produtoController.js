const pool = require('../config/database');

async function listar(req, res) {
  try {
    const { nome, categoria } = req.query;

    const resultado = await pool.query(`
      SELECT
        p.id_produto,
        p.nome,
        p.descricao,
        p.id_categoria,
        p.id_fornecedor,
        c.nome AS categoria,
        f.nome AS fornecedor
      FROM produtos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
      JOIN fornecedores f ON p.id_fornecedor = f.id_fornecedor
      WHERE
        ($1::text IS NULL OR p.nome ILIKE '%' || $1 || '%')
        AND
        ($2::text IS NULL OR c.nome ILIKE '%' || $2 || '%')
      ORDER BY p.nome
    `, [nome || null, categoria || null]);

    return res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      mensagem: 'Erro ao listar produtos.'
    });
  }
}

async function criar(req, res) {
  try {
    const { nome, descricao, id_categoria, id_fornecedor } = req.body;

    if (!nome || !id_categoria || !id_fornecedor) {
      return res.status(400).json({
        mensagem: 'Nome, categoria e fornecedor são obrigatórios.'
      });
    }

    const resultado = await pool.query(
      `INSERT INTO produtos
       (nome, descricao, id_categoria, id_fornecedor)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nome, descricao, id_categoria, id_fornecedor]
    );

    return res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    if (erro.code === '23503') {
      return res.status(400).json({
        mensagem: 'Categoria ou fornecedor inválido.'
      });
    }

    return res.status(500).json({ mensagem: 'Erro ao cadastrar produto.' });
  }
}

async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { nome, descricao, id_categoria, id_fornecedor } = req.body;

    const resultado = await pool.query(
      `UPDATE produtos
       SET nome = $1,
           descricao = $2,
           id_categoria = $3,
           id_fornecedor = $4
       WHERE id_produto = $5
       RETURNING *`,
      [nome, descricao, id_categoria, id_fornecedor, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }

    return res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: 'Erro ao atualizar produto.' });
  }
}

async function remover(req, res) {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM produtos
       WHERE id_produto = $1
       RETURNING *`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }

    return res.json({ mensagem: 'Produto removido com sucesso.' });
  } catch (erro) {
    console.error(erro);

    if (erro.code === '23503') {
      return res.status(409).json({
        mensagem: 'Produto vinculado a lotes não pode ser excluído.'
      });
    }

    return res.status(500).json({ mensagem: 'Erro ao remover produto.' });
  }
}

module.exports = {
  listar,
  criar,
  atualizar,
  remover
};