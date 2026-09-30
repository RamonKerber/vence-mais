import { useEffect, useState } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';

function Relatorios() {
  const [validade, setValidade] = useState([]);
  const [perdas, setPerdas] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    async function carregarRelatorios() {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const [resValidade, resPerdas] = await Promise.all([
          api.get('/relatorios/validade', config),
          api.get('/relatorios/perdas', config)
        ]);

        setValidade(resValidade.data);
        setPerdas(resPerdas.data);
      } catch (erro) {
        console.error('Erro ao carregar relatórios:', erro);
      }
    }

    carregarRelatorios();
  }, []);

  return (
    <div className="sistema">
      <Sidebar />

      <main className="conteudo">
        <h2>Relatórios</h2>

        <h3 className="titulo-relatorio">Validade dos lotes</h3>

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
              {validade.map((item) => (
                <tr key={item.id_lote}>
                  <td>{item.produto}</td>
                  <td>#{item.id_lote}</td>
                  <td>{item.quantidade}</td>

                  <td>
                    {new Date(item.data_validade).toLocaleDateString('pt-BR')}
                  </td>

                  <td>{item.dias_restantes}</td>

                  <td>
                    <span
                      className={
                        item.situacao === 'VENCIDO'
                          ? 'status vencido'
                          : item.situacao === 'PRÓXIMO DO VENCIMENTO'
                          ? 'status proximo'
                          : 'status normal'
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

        <h3 className="titulo-relatorio">Perdas por produto</h3>

        <div className="tabela-container">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Quantidade descartada</th>
                <th>Valor perdido</th>
              </tr>
            </thead>

            <tbody>
              {perdas.map((item) => (
                <tr key={item.produto}>
                  <td>{item.produto}</td>
                  <td>{item.quantidade_descartada}</td>
                  <td>
                    R$ {Number(item.valor_perdido).toFixed(2)}
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

export default Relatorios;