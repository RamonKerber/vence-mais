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

  const token = localStorage.getItem('token');

  async function carregarDados() {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const [resLotes, resProdutos] = await Promise.all([
        axios.get('http://localhost:3000/lotes', config),
        axios.get('http://localhost:3000/produtos', config)
      ]);

      setLotes(resLotes.data);
      setProdutos(resProdutos.data);
    } catch (erro) {
      console.error('Erro ao carregar lotes:', erro);
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

    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
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
    if (!window.confirm('Deseja realmente excluir este lote?')) return;

    try {
      await axios.delete(
        `http://localhost:3000/lotes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      carregarDados();
    } catch (erro) {
      alert(
        erro.response?.data?.mensagem ||
        'Não foi possível excluir o lote.'
      );
    }
  }

  return (
    <div className="sistema">
      <Sidebar />

      <main className="conteudo">
        <div className="cabecalho-pagina">
          <h2>Lotes</h2>

          <button
            className="botao-verde"
            onClick={() => setMostrarFormulario(true)}
          >
            Novo lote
          </button>
        </div>

        {mostrarFormulario && (
          <div className="formulario-card">
            <h3>{loteEditando ? 'Editar lote' : 'Novo lote'}</h3>

            <form onSubmit={salvarLote}>
              <select
                value={idProduto}
                onChange={(e) => setIdProduto(e.target.value)}
                required
              >
                <option value="">Selecione o produto</option>

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
                onChange={(e) => setQuantidade(e.target.value)}
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
                onChange={(e) => setDataValidade(e.target.value)}
                required
              />

              <div className="botoes-formulario">
                <button type="submit" className="botao-verde">
                  {loteEditando ? 'Salvar alterações' : 'Salvar'}
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
                <th>Quantidade</th>
                <th>Preço</th>
                <th>Validade</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {lotes.map((lote) => (
                <tr key={lote.id_lote}>
                  <td>{lote.produto}</td>
                  <td>{lote.quantidade}</td>
                  <td>R$ {Number(lote.preco).toFixed(2)}</td>
                  <td>
                    {new Date(lote.data_validade).toLocaleDateString('pt-BR')}
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
                      onClick={() => excluirLote(lote.id_lote)}
                    >
                      Excluir
                    </button>
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

export default Lotes;