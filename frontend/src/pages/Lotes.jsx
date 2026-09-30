import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

function Lotes() {
  const [lotes, setLotes] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loteEditando, setLoteEditando] = useState(null);

  const [idProduto, setIdProduto] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  const [dataValidade, setDataValidade] = useState('');

  const [filtroProduto, setFiltroProduto] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState('');
  const [filtroData, setFiltroData] = useState('');

  const token = localStorage.getItem('token');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  async function carregarDados() {
    try {
      const [resLotes, resProdutos] = await Promise.all([
        axios.get('http://localhost:3000/lotes', config),
        axios.get('http://localhost:3000/produtos', config)
      ]);

      setLotes(resLotes.data);
      setProdutos(resProdutos.data);
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function limparFormulario() {
    setIdProduto('');
    setQuantidade('');
    setPreco('');
    setDataValidade('');
    setLoteEditando(null);
    setMostrarFormulario(false);
  }

  function editarLote(lote) {
    setLoteEditando(lote.id_lote);
    setIdProduto(lote.id_produto);
    setQuantidade(lote.quantidade);
    setPreco(lote.preco);
    setDataValidade(lote.data_validade.split('T')[0]);
    setMostrarFormulario(true);
  }

  async function salvarLote(event) {
    event.preventDefault();

    const dados = {
      id_produto: Number(idProduto),
      quantidade: Number(quantidade),
      preco: Number(preco),
      data_validade: dataValidade
    };

    try {
      if (loteEditando) {
        await axios.put(
          `http://localhost:3000/lotes/${loteEditando}`,
          dados,
          config
        );
      } else {
        await axios.post(
          'http://localhost:3000/lotes',
          dados,
          config
        );
      }

      limparFormulario();
      carregarDados();
    } catch (erro) {
      alert(
        erro.response?.data?.mensagem ||
        'Erro ao salvar lote.'
      );
    }
  }

  async function excluirLote(id) {
    const confirmar = window.confirm(
      'Deseja realmente excluir este lote?'
    );

    if (!confirmar) return;

    try {
      await axios.delete(
        `http://localhost:3000/lotes/${id}`,
        config
      );

      carregarDados();
    } catch (erro) {
      alert(
        erro.response?.data?.mensagem ||
        'Não foi possível excluir o lote.'
      );
    }
  }

  async function filtrarLotes(
    produto = filtroProduto,
    situacao = filtroSituacao,
    data = filtroData
  ) {
    try {
      const resposta = await axios.get(
        'http://localhost:3000/lotes',
        {
          headers: {
            Authorization: `Bearer ${token}`
          },

          params: {
            produto: produto || undefined,
            situacao: situacao || undefined,
            data_validade: data || undefined
          }
        }
      );

      setLotes(resposta.data);
    } catch (erro) {
      console.error('Erro ao filtrar lotes:', erro);
    }
  }

  function limparFiltros() {
    setFiltroProduto('');
    setFiltroSituacao('');
    setFiltroData('');

    filtrarLotes('', '', '');
  }

  return (
    <div className="sistema">
      <Sidebar />

      <main className="conteudo">
        <div className="cabecalho-pagina">
          <h2>Lotes</h2>

          <button
            className="botao-verde"
            onClick={() => {
              limparFormulario();
              setMostrarFormulario(true);
            }}
          >
            Novo lote
          </button>
        </div>

        {mostrarFormulario && (
          <div className="formulario-card">
            <h3>
              {loteEditando ? 'Editar lote' : 'Novo lote'}
            </h3>

            <form onSubmit={salvarLote}>
              <select
                value={idProduto}
                onChange={(e) => setIdProduto(e.target.value)}
                required
              >
                <option value="">
                  Selecione o produto
                </option>

                {produtos.map((produto) => (
                  <option
                    key={produto.id_produto}
                    value={produto.id_produto}
                  >
                    {produto.nome}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Quantidade"
                min="0"
                value={quantidade}
                onChange={(e) =>
                  setQuantidade(e.target.value)
                }
                required
              />

              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Preço unitário"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                required
              />

              <input
                type="date"
                value={dataValidade}
                onChange={(e) =>
                  setDataValidade(e.target.value)
                }
                required
              />

              <div className="botoes-formulario">
                <button
                  type="submit"
                  className="botao-verde"
                >
                  {loteEditando
                    ? 'Salvar alterações'
                    : 'Salvar'}
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

        <div className="filtros">
          <input
            type="text"
            placeholder="Pesquisar produto..."
            value={filtroProduto}
            onChange={(e) =>
              setFiltroProduto(e.target.value)
            }
          />

          <select
            value={filtroSituacao}
            onChange={(e) =>
              setFiltroSituacao(e.target.value)
            }
          >
            <option value="">
              Todas as situações
            </option>

            <option value="proximo">
              Próximo do vencimento
            </option>

            <option value="vencido">
              Vencido
            </option>

            <option value="normal">
              Normal
            </option>
          </select>

          <input
            type="date"
            value={filtroData}
            onChange={(e) =>
              setFiltroData(e.target.value)
            }
          />

          <button
            className="botao-verde"
            onClick={() => filtrarLotes()}
          >
            Filtrar
          </button>

          <button
            className="botao-cinza"
            onClick={limparFiltros}
          >
            Limpar
          </button>
        </div>

        <div className="tabela-container">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Preço</th>
                <th>Validade</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {lotes.map((lote) => (
                <tr key={lote.id_lote}>
                  <td>{lote.produto}</td>

                  <td>{lote.quantidade}</td>

                  <td>
                    R$ {Number(lote.preco).toFixed(2)}
                  </td>

                  <td>
                    {new Date(
                      lote.data_validade
                    ).toLocaleDateString('pt-BR')}
                  </td>

                  <td>
                    <span
                      className={
                        lote.situacao === 'VENCIDO'
                          ? 'status vencido'
                          : lote.situacao ===
                            'PRÓXIMO DO VENCIMENTO'
                          ? 'status proximo'
                          : 'status normal'
                      }
                    >
                      {lote.situacao}
                    </span>
                  </td>

                  <td>
                    <button
                      className="botao-editar"
                      onClick={() => editarLote(lote)}
                    >
                      Editar
                    </button>

                    <button
                      className="botao-excluir"
                      onClick={() =>
                        excluirLote(lote.id_lote)
                      }
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}

              {lotes.length === 0 && (
                <tr>
                  <td colSpan="6">
                    Nenhum lote encontrado.
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

export default Lotes;