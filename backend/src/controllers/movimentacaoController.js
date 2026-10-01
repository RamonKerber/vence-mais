const pool = require('../config/database');

async function registrar(req, res) {
  const { id_lote, quantidade, tipo, data_movimentacao } = req.body;

  if (!id_lote || !quantidade || !tipo || !data_movimentacao) {
    return res.status(400).json({
      mensagem: 'Preencha todos os campos obrigatórios.'
    });
  }

  if (!Number.isInteger(Number(quantidade)) || Number(quantidade) <= 0) {
    return res.status(400).json({
      mensagem: 'A quantidade deve ser um número inteiro maior que zero.'
    });
  }

  if (!['VENDA', 'CONSUMO', 'OUTROS'].includes(tipo)) {
    return res.status(400).json({
      mensagem: 'Tipo de movimentação inválido.'
    });
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(data_movimentacao) ||
    Number.isNaN(Date.parse(data_movimentacao))
  ) {
    return res.status(400).json({
      mensagem: 'Data inválida.'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const lote = await client.query(
      'SELECT quantidade FROM lotes WHERE id_lote = $1 FOR UPDATE',
      [id_lote]
    );

    if (lote.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        mensagem: 'Lote não encontrado.'
      });
    }

    if (Number(quantidade) > lote.rows[0].quantidade) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        mensagem: 'Quantidade superior ao estoque disponível.'
      });
    }

    const data = await client.query(
      'SELECT $1::date > CURRENT_DATE AS futura',
      [data_movimentacao]
    );

    if (data.rows[0].futura) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        mensagem: 'A data da movimentação não pode ser futura.'
      });
    }

    const resultado = await client.query(
      `INSERT INTO movimentacoes_estoque
       (id_lote, quantidade, tipo, data_movimentacao)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id_lote, quantidade, tipo, data_movimentacao]
    );

    await client.query(
      `UPDATE lotes
       SET quantidade = quantidade - $1
       WHERE id_lote = $2`,
      [quantidade, id_lote]
    );

    await client.query('COMMIT');

    return res.status(201).json(resultado.rows[0]);

  } catch (erro) {
    await client.query('ROLLBACK');
    console.error(erro);

    return res.status(500).json({
      mensagem: 'Erro ao registrar movimentação.'
    });
  } finally {
    client.release();
  }
}

async function listar(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT
        m.*,
        p.nome AS produto
      FROM movimentacoes_estoque m
      JOIN lotes l ON l.id_lote = m.id_lote
      JOIN produtos p ON p.id_produto = l.id_produto
      ORDER BY m.data_movimentacao DESC, m.id_movimentacao DESC
    `);

    return res.json(resultado.rows);

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      mensagem: 'Erro ao listar movimentações.'
    });
  }
}

module.exports = { registrar, listar };