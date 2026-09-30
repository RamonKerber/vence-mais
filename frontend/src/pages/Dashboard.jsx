import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

function Dashboard() {
  const [dados, setDados] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const token = localStorage.getItem('token');

        const resposta = await api.get('/dashboard');

        setDados(resposta.data);
      } catch {
        localStorage.removeItem('token');
        navigate('/');
      }
    }

    carregarDashboard();
  }, [navigate]);

  if (!dados) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="sistema">
      <Sidebar />

      <main className="conteudo">
        <h2>Dashboard</h2>

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
              R$ {Number(dados.valor_total_perdido).toFixed(2)}
            </strong>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;