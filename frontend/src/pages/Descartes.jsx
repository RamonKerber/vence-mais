import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

function Descartes() {
  const [descartes, setDescartes] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [idLote, setIdLote] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [data, setData] = useState('');
  const [motivo, setMotivo] = useState('');

  const token = localStorage.getItem('token');

  async function carregarDados() {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    try {
      const [resDescartes, resLotes] = await Promise.all([
        axios.get('http://localhost:3000/descartes', config),
        axios.get('http://localhost:3000/lotes', config)
      ]);

      setDescartes(resDescartes.data);
      setLotes(resLotes.data);
    } catch (erro) {
      console.error('Erro ao carregar descartes:', erro);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function limparFormulario() {
    setIdLote('');
    setQuantidade('');
    setData('');
    setMotivo('');
    setMostrarFormulario(false);
  }

  async function registrarDescarte(event) {
    event.preventDefault();

    try {
      await axios.post(
        'http://localhost:3000/descartes',
        {
          id_lote: Number(idLote),
          quantidade_descartada: Number(quantidade),
          data_descarte: data,
          motivo
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      limparFormulario();
      carregarDados();
    } catch (erro) {
      alert(
        erro.response?.data?.mensagem ||
        'Erro ao registrar descarte.'
      );
    }
  }

  return (
    <div className="sistema">
      <Sidebar />

      <main className="conteudo">
        <div className="cabecalho-pagina">
          <h2>Descartes</h2>

          <button
            className="botao-verde"
            onClick={() => setMostrarFormulario(true)}
          >
            Registrar descarte
          </button>
        </div>

        {mostrarFormulario && (
          <div className="formulario-card">
            <h3>Novo descarte</h3>

            <form onSubmit={registrarDescarte}>
              <select
                value={idLote}
                onChange={(e) => setIdLote(e.target.value)}
                required
              >
                <option value="">Selecione o lote</option>

                {lotes.map((lote) => (
                  <option
                    key={lote.id_lote}
                    value={lote.id_lote}
                  >
                    #{lote.id_lote} - {lote.produto} ({lote.quantidade} un.)
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                placeholder="Quantidade descartada"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                required
              />

              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Motivo do descarte"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
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
                <th>Data</th>
                <th>Motivo</th>
                <th>Valor perdido</th>
              </tr>
            </thead>

            <tbody>
              {descartes.map((descarte) => (
                <tr key={descarte.id_descarte}>
                  <td>{descarte.produto}</td>
                  <td>#{descarte.id_lote}</td>
                  <td>{descarte.quantidade_descartada}</td>

                  <td>
                    {new Date(
                      descarte.data_descarte
                    ).toLocaleDateString('pt-BR')}
                  </td>

                  <td>{descarte.motivo}</td>

                  <td>
                    R$ {Number(descarte.valor_perdido).toFixed(2)}
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

export default Descartes;