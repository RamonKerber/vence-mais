import { useEffect, useState } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';

function Movimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [idLote, setIdLote] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [tipo, setTipo] = useState('');
  const [data, setData] = useState('');

  async function carregarDados() {
    try {
      const [resMovimentacoes, resLotes] = await Promise.all([
        api.get('/movimentacoes'),
        api.get('/lotes')
      ]);

      setMovimentacoes(resMovimentacoes.data);
      setLotes(resLotes.data);
    } catch (erro) {
      console.error('Erro ao carregar movimentações:', erro);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function limparFormulario() {
    setIdLote('');
    setQuantidade('');
    setTipo('');
    setData('');
    setMostrarFormulario(false);
  }

  async function registrarMovimentacao(event) {
    event.preventDefault();

    try {
      await api.post('/movimentacoes', {
        id_lote: Number(idLote),
        quantidade: Number(quantidade),
        tipo,
        data_movimentacao: data
      });

      limparFormulario();
      carregarDados();
    } catch (erro) {
      alert(
        erro.response?.data?.mensagem ||
        'Erro ao registrar movimentação.'
      );
    }
  }

  return (
    <div className="sistema">
      <Sidebar />

      <main className="conteudo">
        <div className="cabecalho-pagina">
          <h2>Movimentações de estoque</h2>

          <button
            className="botao-verde"
            onClick={() => setMostrarFormulario(true)}
          >
            Registrar saída
          </button>
        </div>

        {mostrarFormulario && (
          <div className="formulario-card">
            <h3>Nova movimentação</h3>

            <form onSubmit={registrarMovimentacao}>
              <select
                value={idLote}
                onChange={(e) => setIdLote(e.target.value)}
                required
              >
                <option value="">Selecione o lote</option>

                {lotes
                  .filter((lote) => lote.quantidade > 0)
                  .map((lote) => (
                    <option
                      key={lote.id_lote}
                      value={lote.id_lote}
                    >
                      #{lote.id_lote} - {lote.produto}
                      {' '}({lote.quantidade} un.)
                    </option>
                  ))}
              </select>

              <input
                type="number"
                min="1"
                step="1"
                placeholder="Quantidade"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                required
              />

              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                required
              >
                <option value="">Tipo de saída</option>
                <option value="VENDA">Venda</option>
                <option value="CONSUMO">Consumo</option>
                <option value="OUTROS">Outros</option>
              </select>

              <input
                type="date"
                max={new Date().toLocaleDateString('en-CA')}
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
              />

              <div className="botoes-formulario">
                <button type="submit" className="botao-verde">
                  Registrar
                </button>

                <button
                  type="button"
                  className="botao-cinza"
                  onClick={limparFormulario}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="tabela-container">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Lote</th>
                <th>Quantidade</th>
                <th>Tipo</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {movimentacoes.map((item) => (
                <tr key={item.id_movimentacao}>
                  <td>{item.produto}</td>
                  <td>#{item.id_lote}</td>
                  <td>{item.quantidade}</td>
                  <td>{item.tipo}</td>
                  <td>
                    {new Date(
                      item.data_movimentacao
                    ).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}

              {movimentacoes.length === 0 && (
                <tr>
                  <td colSpan="5">
                    Nenhuma movimentação registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Movimentacoes;