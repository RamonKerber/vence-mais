import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [idCategoria, setIdCategoria] = useState('');
  const [idFornecedor, setIdFornecedor] = useState('');

  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  const token = localStorage.getItem('token');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  async function carregarDados() {
    try {
      const [resProdutos, resCategorias, resFornecedores] =
        await Promise.all([
          axios.get('http://localhost:3000/produtos', config),
          axios.get('http://localhost:3000/categorias', config),
          axios.get('http://localhost:3000/fornecedores', config)
        ]);

      setProdutos(resProdutos.data);
      setCategorias(resCategorias.data);
      setFornecedores(resFornecedores.data);
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function limparFormulario() {
    setNome('');
    setDescricao('');
    setIdCategoria('');
    setIdFornecedor('');
    setProdutoEditando(null);
    setMostrarFormulario(false);
  }

  function editarProduto(produto) {
    setProdutoEditando(produto.id_produto);
    setNome(produto.nome);
    setDescricao(produto.descricao || '');
    setIdCategoria(produto.id_categoria);
    setIdFornecedor(produto.id_fornecedor);
    setMostrarFormulario(true);
  }

  async function salvarProduto(event) {
    event.preventDefault();

    const dados = {
      nome,
      descricao,
      id_categoria: Number(idCategoria),
      id_fornecedor: Number(idFornecedor)
    };

    try {
      if (produtoEditando) {
        await axios.put(
          `http://localhost:3000/produtos/${produtoEditando}`,
          dados,
          config
        );
      } else {
        await axios.post(
          'http://localhost:3000/produtos',
          dados,
          config
        );
      }

      limparFormulario();
      carregarDados();
    } catch (erro) {
      alert(
        erro.response?.data?.mensagem ||
        'Erro ao salvar produto.'
      );
    }
  }

  async function excluirProduto(id) {
    const confirmar = window.confirm(
      'Deseja realmente excluir este produto?'
    );

    if (!confirmar) return;

    try {
      await axios.delete(
        `http://localhost:3000/produtos/${id}`,
        config
      );

      carregarDados();
    } catch (erro) {
      alert(
        erro.response?.data?.mensagem ||
        'Não foi possível excluir o produto.'
      );
    }
  }

  async function filtrarProdutos(
    nomeFiltro = filtroNome,
    categoriaFiltro = filtroCategoria
  ) {
    try {
      const resposta = await axios.get(
        'http://localhost:3000/produtos',
        {
          headers: {
            Authorization: `Bearer ${token}`
          },

          params: {
            nome: nomeFiltro || undefined,
            categoria: categoriaFiltro || undefined
          }
        }
      );

      setProdutos(resposta.data);
    } catch (erro) {
      console.error('Erro ao filtrar produtos:', erro);
    }
  }

  function limparFiltros() {
    setFiltroNome('');
    setFiltroCategoria('');
    filtrarProdutos('', '');
  }

  return (
    <div className="sistema">
      <Sidebar />

      <main className="conteudo">
        <div className="cabecalho-pagina">
          <h2>Produtos</h2>

          <button
            className="botao-verde"
            onClick={() => {
              limparFormulario();
              setMostrarFormulario(true);
            }}
          >
            Novo produto
          </button>
        </div>

        {mostrarFormulario && (
          <div className="formulario-card">
            <h3>
              {produtoEditando
                ? 'Editar produto'
                : 'Novo produto'}
            </h3>

            <form onSubmit={salvarProduto}>
              <input
                type="text"
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Descrição"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />

              <select
                value={idCategoria}
                onChange={(e) => setIdCategoria(e.target.value)}
                required
              >
                <option value="">
                  Selecione a categoria
                </option>

                {categorias.map((categoria) => (
                  <option
                    key={categoria.id_categoria}
                    value={categoria.id_categoria}
                  >
                    {categoria.nome}
                  </option>
                ))}
              </select>

              <select
                value={idFornecedor}
                onChange={(e) => setIdFornecedor(e.target.value)}
                required
              >
                <option value="">
                  Selecione o fornecedor
                </option>

                {fornecedores.map((fornecedor) => (
                  <option
                    key={fornecedor.id_fornecedor}
                    value={fornecedor.id_fornecedor}
                  >
                    {fornecedor.nome}
                  </option>
                ))}
              </select>

              <div className="botoes-formulario">
                <button
                  type="submit"
                  className="botao-verde"
                >
                  {produtoEditando
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
            placeholder="Pesquisar por nome..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />

          <select
            value={filtroCategoria}
            onChange={(e) =>
              setFiltroCategoria(e.target.value)
            }
          >
            <option value="">
              Todas as categorias
            </option>

            {categorias.map((categoria) => (
              <option
                key={categoria.id_categoria}
                value={categoria.nome}
              >
                {categoria.nome}
              </option>
            ))}
          </select>

          <button
            className="botao-verde"
            onClick={() => filtrarProdutos()}
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
                <th>Nome</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Fornecedor</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {produtos.map((produto) => (
                <tr key={produto.id_produto}>
                  <td>{produto.nome}</td>
                  <td>{produto.descricao}</td>
                  <td>{produto.categoria}</td>
                  <td>{produto.fornecedor}</td>

                  <td>
                    <button
                      className="botao-editar"
                      onClick={() =>
                        editarProduto(produto)
                      }
                    >
                      Editar
                    </button>

                    <button
                      className="botao-excluir"
                      onClick={() =>
                        excluirProduto(
                          produto.id_produto
                        )
                      }
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}

              {produtos.length === 0 && (
                <tr>
                  <td colSpan="5">
                    Nenhum produto encontrado.
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

export default Produtos;