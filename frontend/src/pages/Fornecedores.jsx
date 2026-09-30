import { useEffect, useState } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';

function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [fornecedorEditando, setFornecedorEditando] = useState(null);

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  const token = localStorage.getItem('token');

  async function carregarFornecedores() {
    try {
      const resposta = await api.get(
        '/fornecedores',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setFornecedores(resposta.data);
    } catch (erro) {
      console.error('Erro ao carregar fornecedores:', erro);
    }
  }

  useEffect(() => {
    carregarFornecedores();
  }, []);

  function limparFormulario() {
    setNome('');
    setTelefone('');
    setEmail('');
    setFornecedorEditando(null);
    setMostrarFormulario(false);
  }

  function editarFornecedor(fornecedor) {
    setFornecedorEditando(fornecedor.id_fornecedor);
    setNome(fornecedor.nome);
    setTelefone(fornecedor.telefone || '');
    setEmail(fornecedor.email || '');
    setMostrarFormulario(true);
  }

  async function salvarFornecedor(event) {
    event.preventDefault();

    const dados = {
      nome,
      telefone,
      email
    };

    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    try {
      if (fornecedorEditando) {
        await api.put(
          `/fornecedores/${fornecedorEditando}`,
          dados,
          config
        );
      } else {
        await api.post(
          '/fornecedores',
          dados,
          config
        );
      }

      limparFormulario();
      carregarFornecedores();
    } catch (erro) {
      alert(
        erro.response?.data?.mensagem ||
        'Erro ao salvar fornecedor.'
      );
    }
  }

  async function excluirFornecedor(id) {
    const confirmar = window.confirm(
      'Deseja realmente excluir este fornecedor?'
    );

    if (!confirmar) return;

    try {
      await api.delete(
        `/fornecedores/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      carregarFornecedores();
    } catch (erro) {
      alert(
        erro.response?.data?.mensagem ||
        'Não foi possível excluir o fornecedor.'
      );
    }
  }

  return (
    <div className="sistema">
      <Sidebar />

      <main className="conteudo">
        <div className="cabecalho-pagina">
          <h2>Fornecedores</h2>

          <button
            className="botao-verde"
            onClick={() => setMostrarFormulario(true)}
          >
            Novo fornecedor
          </button>
        </div>

        {mostrarFormulario && (
          <div className="formulario-card">
            <h3>
              {fornecedorEditando
                ? 'Editar fornecedor'
                : 'Novo fornecedor'}
            </h3>

            <form onSubmit={salvarFornecedor}>
              <input
                type="text"
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />

              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="botoes-formulario">
                <button type="submit" className="botao-verde">
                  {fornecedorEditando
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
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {fornecedores.map((fornecedor) => (
                <tr key={fornecedor.id_fornecedor}>
                  <td>{fornecedor.nome}</td>
                  <td>{fornecedor.telefone}</td>
                  <td>{fornecedor.email}</td>

                  <td>
                    <button
                      className="botao-editar"
                      onClick={() => editarFornecedor(fornecedor)}
                    >
                      Editar
                    </button>

                    <button
                      className="botao-excluir"
                      onClick={() =>
                        excluirFornecedor(fornecedor.id_fornecedor)
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

export default Fornecedores;