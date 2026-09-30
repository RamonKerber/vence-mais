const pool = require('../config/database');

async function registrar(req, res) {
  const client = await pool.connect();

  try {
    const { id_lote, quantidade_descartada, data_descarte, motivo } = req.body;

    if (!id_lote || !quantidade_descartada || !data_descarte || !motivo) {
      return res.status(400).json({
        mensagem: 'Lote, quantidade, data e motivo são obrigatórios.'
      });
    }

    await client.query('BEGIN');

    const lote = await client.query(
      `SELECT quantidade
       FROM lotes
       WHERE id_lote = $1
       FOR UPDATE`,
      [id_lote]
    );

    if (lote.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        mensagem: 'Lote não encontrado.'
      });
    }

    const quantidadeDisponivel = lote.rows[0].quantidade;

    if (quantidade_descartada <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        mensagem: 'A quantidade descartada deve ser maior que zero.'
      });
    }

    if (quantidade_descartada > quantidadeDisponivel) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        mensagem: 'Quantidade descartada maior que a disponível no lote.'
      });
    }

    const descarte = await client.query(
      `INSERT INTO descartes
       (id_lote, quantidade_descartada, data_descarte, motivo)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id_lote, quantidade_descartada, data_descarte, motivo]
    );

    await client.query(
      `UPDATE lotes
       SET quantidade = quantidade - $1
       WHERE id_lote = $2`,
      [quantidade_descartada, id_lote]
    );

    await client.query('COMMIT');

    return res.status(201).json(descarte.rows[0]);

  } catch (erro) {
    await client.query('ROLLBACK');
    console.error(erro);

    return res.status(500).json({
      mensagem: 'Erro ao registrar descarte.'
    });
  } finally {
    client.release();
  }
}

async function listar(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT
        d.id_descarte,
        d.quantidade_descartada,
        d.data_descarte,
        d.motivo,
        l.id_lote,
        p.nome AS produto,
        l.preco,
        ROUND((d.quantidade_descartada * l.preco)::numeric, 2) AS valor_perdido
      FROM descartes d
      JOIN lotes l ON l.id_lote = d.id_lote
      JOIN produtos p ON p.id_produto = l.id_produto
      ORDER BY d.data_descarte DESC
    `);

    return res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      mensagem: 'Erro ao consultar histórico de perdas.'
    });
  }
}

module.exports = {
  registrar,
  listar
};