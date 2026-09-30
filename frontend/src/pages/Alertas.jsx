import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [riscos, setRiscos] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    async function carregarDados() {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const [resAlertas, resRiscos] = await Promise.all([
          axios.get('http://localhost:3000/alertas', config),
          axios.get('http://localhost:3000/alertas/riscos', config)
        ]);

        setAlertas(resAlertas.data);
        setRiscos(resRiscos.data);
      } catch (erro) {
        console.error('Erro ao carregar alertas:', erro);
      }
    }

    carregarDados();
  }, []);

  return (
    <div className="sistema">
      <Sidebar />

      <main className="conteudo">
        <h2>Alertas de validade</h2>

        <div className="tabela-container">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Lote</th>
                <th>Quantidade</th>
                <th>Validade</th>
                <th>Dias restantes</th>
                <th>Situação</th>
              </tr>
            </thead>

            <tbody>
              {alertas.map((item) => (
                <tr key={item.id_lote}>
                  <td>{item.produto}</td>
                  <td>#{item.id_lote}</td>
                  <td>{item.quantidade}</td>

                  <td>
                    {new Date(item.data_validade)
                      .toLocaleDateString('pt-BR')}
                  </td>

                  <td>{item.dias_restantes}</td>

                  <td>
                    <span
                      className={
                        item.situacao === 'VENCIDO'
                          ? 'status vencido'
                          : 'status proximo'
                      }
                    >
                      {item.situacao}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="titulo-relatorio">
          Classificação de risco
        </h3>

        <div className="tabela-container">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Lote</th>
                <th>Quantidade</th>
                <th>Valor em risco</th>
                <th>Dias restantes</th>
                <th>Risco</th>
              </tr>
            </thead>

            <tbody>
              {riscos.map((item) => (
                <tr key={item.id_lote}>
                  <td>{item.produto}</td>
                  <td>#{item.id_lote}</td>
                  <td>{item.quantidade}</td>

                  <td>
                    R$ {Number(item.valor_em_risco).toFixed(2)}
                  </td>

                  <td>{item.dias_restantes}</td>

                  <td>
                    <span
                      className={`risco ${item.risco.toLowerCase()}`}
                    >
                      {item.risco}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Alertas;