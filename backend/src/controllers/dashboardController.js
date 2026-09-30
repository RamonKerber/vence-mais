const pool = require('../config/database');

async function resumo(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT
        (
          SELECT COUNT(*)
          FROM produtos
        ) AS total_produtos,

        (
          SELECT COUNT(*)
          FROM lotes
        ) AS total_lotes,

        (
          SELECT COUNT(*)
          FROM lotes
          WHERE quantidade > 0
          AND data_validade >= CURRENT_DATE
          AND data_validade <= CURRENT_DATE + INTERVAL '7 days'
        ) AS proximos_vencimento,

        (
          SELECT COUNT(*)
          FROM lotes
          WHERE quantidade > 0
          AND data_validade < CURRENT_DATE
        ) AS vencidos,

        (
          SELECT COALESCE(
            SUM(quantidade_descartada),
            0
          )
          FROM descartes
        ) AS quantidade_descartada,

        (
          SELECT COALESCE(
            ROUND(
              SUM(d.quantidade_descartada * l.preco)::numeric,
              2
            ),
            0
          )
          FROM descartes d
          JOIN lotes l
            ON l.id_lote = d.id_lote
        ) AS valor_total_perdido
    `);

    return res.json(resultado.rows[0]);

  } catch (erro) {
    console.error('Erro no dashboard:', erro);

    return res.status(500).json({
      mensagem: 'Erro ao carregar dashboard.'
    });
  }
}

module.exports = {
  resumo
};