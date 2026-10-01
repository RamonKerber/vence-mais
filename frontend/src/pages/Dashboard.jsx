import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

import api from '../api';
import Sidebar from '../components/Sidebar';

function Dashboard() {
  const [dados, setDados] = useState(null);
  const [perdas, setPerdas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [riscos, setRiscos] = useState([]);
  const [erro, setErro] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const resposta = await api.get('/dashboard');

        setDados(resposta.data);

        const resultados = await Promise.allSettled([
          api.get('/relatorios/perdas'),
          api.get('/lotes'),
          api.get('/alertas/riscos')
        ]);

        if (resultados[0].status === 'fulfilled') {
          setPerdas(resultados[0].value.data);
        }

        if (resultados[1].status === 'fulfilled') {
          setLotes(resultados[1].value.data);
        }

        if (resultados[2].status === 'fulfilled') {
          setRiscos(resultados[2].value.data);
        }

      } catch (erro) {
        if (erro.response?.status === 401 ||
            erro.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/');
        } else {
          setErro('Não foi possível carregar o dashboard.');
        }
      }
    }

    carregarDashboard();
  }, [navigate]);

  if (erro) {
    return (
      <div className="sistema">
        <Sidebar />

        <main className="conteudo">
          <p>{erro}</p>
        </main>
      </div>
    );
  }

  if (!dados) {
    return <p>Carregando...</p>;
  }

  // Dados do gráfico de perdas por produto
  const dadosPerdas = perdas.map((item) => ({
    produto: item.produto,
    valor: Number(
      item.valor_perdido ??
      item.valor_total_perdido ??
      0
    )
  }));

  // Consideramos apenas lotes com estoque disponível
  const lotesDisponiveis = lotes.filter(
    (lote) => Number(lote.quantidade) > 0
  );

  const lotesVencidos = lotesDisponiveis.filter(
    (lote) => lote.situacao === 'VENCIDO'
  ).length;

  const lotesProximos = lotesDisponiveis.filter(
    (lote) => lote.situacao === 'PRÓXIMO DO VENCIMENTO'
  ).length;

  const lotesNormais =
    lotesDisponiveis.length -
    lotesVencidos -
    lotesProximos;

  // Dados do gráfico de situação do estoque
  const dadosEstoque = [
    {
      nome: 'Normal',
      quantidade: lotesNormais,
      cor: '#16a34a'
    },
    {
      nome: 'Próximo do vencimento',
      quantidade: lotesProximos,
      cor: '#f59e0b'
    },
    {
      nome: 'Vencido',
      quantidade: lotesVencidos,
      cor: '#dc2626'
    }
  ].filter((item) => item.quantidade > 0);

  // Estilo utilizado nas seções dos gráficos
  const estiloGrafico = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    minWidth: 0
  };

  return (
    <div className="sistema">
      <Sidebar />

      <main className="conteudo">
        <h2>Dashboard</h2>

        {/* Indicadores existentes */}
        <div className="cards">
          <div className="card">
            <span>Produtos</span>
            <strong>{dados.total_produtos}</strong>
          </div>

          <div className="card">
            <span>Lotes</span>
            <strong>{dados.total_lotes}</strong>
          </div>

          <div className="card">
            <span>Próximos do vencimento</span>
            <strong>{dados.proximos_vencimento}</strong>
          </div>

          <div className="card">
            <span>Vencidos</span>
            <strong>{dados.vencidos}</strong>
          </div>

          <div className="card">
            <span>Itens descartados</span>
            <strong>{dados.quantidade_descartada}</strong>
          </div>

          <div className="card">
            <span>Valor perdido</span>
            <strong>
              {Number(dados.valor_total_perdido).toLocaleString(
                'pt-BR',
                {
                  style: 'currency',
                  currency: 'BRL'
                }
              )}
            </strong>
          </div>
        </div>

        {/* Gráficos */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
            gap: '20px',
            marginTop: '30px'
          }}
        >
          {/* Gráfico de perdas por produto */}
          <div style={estiloGrafico}>
            <h3>Perdas por produto</h3>

            {dadosPerdas.length === 0 ? (
              <p>Nenhuma perda registrada.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dadosPerdas}
                  margin={{
                    top: 20,
                    right: 10,
                    left: 5,
                    bottom: 35
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="produto"
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={65}
                  />

                  <YAxis />

                  <Tooltip
                    formatter={(valor) =>
                      Number(valor).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })
                    }
                  />

                  <Bar
                    dataKey="valor"
                    name="Valor perdido"
                    fill="#16a34a"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Gráfico da situação do estoque */}
          <div style={estiloGrafico}>
            <h3>Situação do estoque</h3>

            {dadosEstoque.length === 0 ? (
              <p>Nenhum lote disponível no estoque.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosEstoque}
                    dataKey="quantidade"
                    nameKey="nome"
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    label
                  >
                    {dadosEstoque.map((item) => (
                      <Cell
                        key={item.nome}
                        fill={item.cor}
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Produtos com maior risco */}
        <div
          style={{
            ...estiloGrafico,
            marginTop: '25px'
          }}
        >
          <h3>Lotes que exigem atenção</h3>

          {riscos.length === 0 ? (
            <p>Nenhum lote com risco identificado.</p>
          ) : (
            <div className="tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Lote</th>
                    <th>Quantidade</th>
                    <th>Risco</th>
                  </tr>
                </thead>

                <tbody>
                  {riscos.slice(0, 5).map((item) => {
                    const risco =
                      item.risco ??
                      item.classificacao ??
                      item.nivel_risco ??
                      'Não informado';

                    return (
                      <tr key={item.id_lote}>
                        <td>{item.produto}</td>

                        <td>#{item.id_lote}</td>

                        <td>{item.quantidade}</td>

                        <td>
                          <strong
                            style={{
                              color:
                                risco === 'ALTO'
                                  ? '#dc2626'
                                  : risco === 'MÉDIO'
                                    ? '#d97706'
                                    : '#16a34a'
                            }}
                          >
                            {risco}
                          </strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;