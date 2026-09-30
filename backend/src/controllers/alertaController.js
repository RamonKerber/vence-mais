const pool = require('../config/database');

async function listarAlertas(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT
        l.id_lote,
        p.nome AS produto,
        l.quantidade,
        l.preco,
        l.data_validade,
        (l.data_validade - CURRENT_DATE) AS dias_restantes,
        CASE
          WHEN l.data_validade < CURRENT_DATE THEN 'VENCIDO'
          WHEN l.data_validade <= CURRENT_DATE + INTERVAL '7 days'
            THEN 'PRÓXIMO DO VENCIMENTO'
          ELSE 'NORMAL'
        END AS situacao
      FROM lotes l
      JOIN produtos p ON p.id_produto = l.id_produto
      WHERE l.data_validade <= CURRENT_DATE + INTERVAL '7 days'
      ORDER BY l.data_validade
    `);

    return res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      mensagem: 'Erro ao consultar alertas.'
    });
  }
}

async function listarRiscos(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT
        l.id_lote,
        p.nome AS produto,
        l.quantidade,
        l.preco,
        l.data_validade,
        ROUND((l.quantidade * l.preco)::numeric, 2) AS valor_em_risco,
        (l.data_validade - CURRENT_DATE) AS dias_restantes,

        CASE
          WHEN l.data_validade < CURRENT_DATE THEN 'ALTO'
          WHEN l.data_validade <= CURRENT_DATE + INTERVAL '3 days'
               AND (l.quantidade * l.preco) >= 50 THEN 'ALTO'
          WHEN l.data_validade <= CURRENT_DATE + INTERVAL '7 days'
               OR (l.quantidade * l.preco) >= 100 THEN 'MÉDIO'
          ELSE 'BAIXO'
        END AS risco

      FROM lotes l
      JOIN produtos p ON p.id_produto = l.id_produto

      ORDER BY
        CASE
          WHEN l.data_validade < CURRENT_DATE THEN 1
          WHEN l.data_validade <= CURRENT_DATE + INTERVAL '3 days'
               AND (l.quantidade * l.preco) >= 50 THEN 1
          WHEN l.data_validade <= CURRENT_DATE + INTERVAL '7 days'
               OR (l.quantidade * l.preco) >= 100 THEN 2
          ELSE 3
        END,
        l.data_validade
    `);

    return res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      mensagem: 'Erro ao calcular riscos.'
    });
  }
}

module.exports = {
  listarAlertas,
  listarRiscos
};