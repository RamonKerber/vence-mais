const pool = require('../config/database');

async function registrar(req, res) {
  const client = await pool.connect();

  try {
    const {
      id_lote,
      quantidade_descartada,
      data_descarte,
      motivo
    } = req.body;

    if (
      !id_lote ||
      !quantidade_descartada ||
      !data_descarte ||
      !motivo
    ) {
      return res.status(400).json({
        mensagem: 'Preencha todos os campos obrigatórios.'
      });
    }

    if (Number(quantidade_descartada) <= 0) {
      return res.status(400).json({
        mensagem: 'A quantidade descartada deve ser maior que zero.'
      });
    }

    const validacaoData = await client.query(
      `
        SELECT $1::date > CURRENT_DATE AS data_futura
      `,
      [data_descarte]
    );

    if (validacaoData.rows[0].data_futura) {
      return res.status(400).json({
        mensagem: 'A data do descarte não pode ser futura.'
      });
    }

    await client.query('BEGIN');

    const resultadoLote = await client.query(
      `
        SELECT quantidade
        FROM lotes
        WHERE id_lote = $1
        FOR UPDATE
      `,
      [id_lote]
    );

    if (resultadoLote.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        mensagem: 'Lote não encontrado.'
      });
    }

    const quantidadeDisponivel =
      resultadoLote.rows[0].quantidade;

    if (quantidadeDisponivel <= 0) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        mensagem: 'Este lote não possui estoque disponível.'
      });
    }

    if (
      Number(quantidade_descartada) >
      quantidadeDisponivel
    ) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        mensagem:
          'A quantidade descartada é maior que o estoque disponível.'
      });
    }

    const resultadoDescarte = await client.query(
      `
        INSERT INTO descartes (
          id_lote,
          quantidade_descartada,
          data_descarte,
          motivo
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [
        id_lote,
        quantidade_descartada,
        data_descarte,
        motivo
      ]
    );

    await client.query(
      `
        UPDATE lotes
        SET quantidade = quantidade - $1
        WHERE id_lote = $2
      `,
      [quantidade_descartada, id_lote]
    );

    await client.query('COMMIT');

    return res.status(201).json(
      resultadoDescarte.rows[0]
    );

  } catch (erro) {
    await client.query('ROLLBACK');

    console.error('Erro ao registrar descarte:', erro);

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
        ROUND(
          (d.quantidade_descartada * l.preco)::numeric,
          2
        ) AS valor_perdido
      FROM descartes d
      JOIN lotes l
        ON l.id_lote = d.id_lote
      JOIN produtos p
        ON p.id_produto = l.id_produto
      ORDER BY d.data_descarte DESC
    `);

    return res.json(resultado.rows);

  } catch (erro) {
    console.error('Erro ao listar descartes:', erro);

    return res.status(500).json({
      mensagem: 'Erro ao listar descartes.'
    });
  }
}

module.exports = {
  registrar,
  listar
};