const pool = require('../config/database');

async function listar(req, res) {
  try {
    const { produto, situacao, data_validade } = req.query;

    let query = `
      SELECT
        l.id_lote,
        l.quantidade,
        l.preco,
        l.data_validade,
        l.id_produto,
        p.nome AS produto,
        CASE
          WHEN l.data_validade < CURRENT_DATE
            THEN 'VENCIDO'
          WHEN l.data_validade <= CURRENT_DATE + INTERVAL '7 days'
            THEN 'PRÓXIMO DO VENCIMENTO'
          ELSE 'NORMAL'
        END AS situacao
      FROM lotes l
      JOIN produtos p
        ON p.id_produto = l.id_produto
      WHERE 1 = 1
    `;

    const valores = [];

    if (produto) {
      valores.push(produto);
      query += `
        AND p.nome ILIKE '%' || $${valores.length} || '%'
      `;
    }

    if (data_validade) {
      valores.push(data_validade);
      query += `
        AND l.data_validade = $${valores.length}
      `;
    }

    if (situacao === 'vencido') {
      query += `
        AND l.data_validade < CURRENT_DATE
      `;
    }

    if (situacao === 'proximo') {
      query += `
        AND l.data_validade >= CURRENT_DATE
        AND l.data_validade <= CURRENT_DATE + INTERVAL '7 days'
      `;
    }

    if (situacao === 'normal') {
      query += `
        AND l.data_validade > CURRENT_DATE + INTERVAL '7 days'
      `;
    }

    query += ` ORDER BY l.data_validade`;

    const resultado = await pool.query(query, valores);

    return res.json(resultado.rows);

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      mensagem: 'Erro ao listar lotes.'
    });
  }
}

async function criar(req, res) {
  try {
    const { id_produto, quantidade, preco, data_validade } = req.body;

    if (!id_produto || quantidade == null || preco == null || !data_validade) {
      return res.status(400).json({
        mensagem: 'Produto, quantidade, preço e validade são obrigatórios.'
      });
    }

    const resultado = await pool.query(
      `INSERT INTO lotes
       (id_produto, quantidade, preco, data_validade)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id_produto, quantidade, preco, data_validade]
    );

    return res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);

    if (erro.code === '23503') {
      return res.status(400).json({ mensagem: 'Produto inválido.' });
    }

    return res.status(500).json({ mensagem: 'Erro ao cadastrar lote.' });
  }
}

async function atualizar(req, res) {
  try {
    const { id } = req.params;
    const { id_produto, quantidade, preco, data_validade } = req.body;

    const resultado = await pool.query(
      `UPDATE lotes
       SET id_produto = $1,
           quantidade = $2,
           preco = $3,
           data_validade = $4
       WHERE id_lote = $5
       RETURNING *`,
      [id_produto, quantidade, preco, data_validade, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Lote não encontrado.' });
    }

    return res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: 'Erro ao atualizar lote.' });
  }
}

async function remover(req, res) {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM lotes
       WHERE id_lote = $1
       RETURNING *`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Lote não encontrado.' });
    }

    return res.json({ mensagem: 'Lote removido com sucesso.' });
  } catch (erro) {
    console.error(erro);

    if (erro.code === '23503') {
      return res.status(409).json({
        mensagem: 'Lote com descartes vinculados não pode ser excluído.'
      });
    }

    return res.status(500).json({ mensagem: 'Erro ao remover lote.' });
  }
}

module.exports = {
  listar,
  criar,
  atualizar,
  remover
};