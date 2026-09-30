import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const token = localStorage.getItem('token');

  async function carregarCategorias() {
    try {
      const resposta = await axios.get(
        'http://localhost:3000/categorias',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setCategorias(resposta.data);
    } catch (erro) {
      console.error('Erro ao carregar categorias:', erro);
    }
  }

  useEffect(() => {
    carregarCategorias();
  }, []);

  function limparFormulario() {
    setNome('');
    setDescricao('');
    setCategoriaEditando(null);
    setMostrarFormulario(false);
  }

  function editarCategoria(categoria) {
    setCategoriaEditando(categoria.id_categoria);
    setNome(categoria.nome);
    setDescricao(categoria.descricao || '');
    setMostrarFormulario(true);
  }

  async function salvarCategoria(event) {
    event.preventDefault();

    const dados = {
      nome,
      descricao
    };

    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    try {
      if (categoriaEditando) {
        await axios.put(
          `http://localhost:3000/categorias/${categoriaEditando}`,
          dados,
          config
        );
      } else {
        await axios.post(
          'http://localhost:3000/categorias',
          dados,
          config
        );
      }

      limparFormulario();
      carregarCategorias();
    } catch (erro) {
      alert(
        erro.response?.data?.mensagem ||
        'Erro ao salvar categoria.'
      );
    }
  }

  async function excluirCategoria(id) {
    const confirmar = window.confirm(
      'Deseja realmente excluir esta categoria?'
    );

    if (!confirmar) return;

    try {
      await axios.delete(
        `http://localhost:3000/categorias/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      carregarCategorias();
    } catch (erro) {
      alert(
        erro.response?.data?.mensagem ||
        'Não foi possível excluir a categoria.'
      );
    }
  }

  return (
    <div className="sistema">
      <Sidebar />

      <main className="conteudo">
        <div className="cabecalho-pagina">
          <h2>Categorias</h2>

          <button
            className="botao-verde"
            onClick={() => setMostrarFormulario(true)}
          >
            Nova categoria
          </button>
        </div>

        {mostrarFormulario && (
          <div className="formulario-card">
            <h3>
              {categoriaEditando
                ? 'Editar categoria'
                : 'Nova categoria'}
            </h3>

            <form onSubmit={salvarCategoria}>
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

              <div className="botoes-formulario">
                <button type="submit" className="botao-verde">
                  {categoriaEditando
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

        <div className="tabela-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {categorias.map((categoria) => (
                <tr key={categoria.id_categoria}>
                  <td>{categoria.nome}</td>
                  <td>{categoria.descricao}</td>

                  <td>
                    <button
                      className="botao-editar"
                      onClick={() => editarCategoria(categoria)}
                    >
                      Editar
                    </button>

                    <button
                      className="botao-excluir"
                      onClick={() =>
                        excluirCategoria(categoria.id_categoria)
                      }
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

export default Categorias;