const pool = require('../config/database');

async function relatorioPerdas(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT
        p.nome AS produto,
        SUM(d.quantidade_descartada) AS quantidade_descartada,
        ROUND(SUM(d.quantidade_descartada * l.preco)::numeric, 2) AS valor_perdido
      FROM descartes d
      JOIN lotes l ON l.id_lote = d.id_lote
      JOIN produtos p ON p.id_produto = l.id_produto
      GROUP BY p.id_produto, p.nome
      ORDER BY valor_perdido DESC
    `);

    return res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      mensagem: 'Erro ao gerar relatório de perdas.'
    });
  }
}

async function relatorioValidade(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT
        p.nome AS produto,
        l.id_lote,
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
      ORDER BY l.data_validade
    `);

    return res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      mensagem: 'Erro ao gerar relatório de validade.'
    });
  }
}

module.exports = {
  relatorioPerdas,
  relatorioValidade
};