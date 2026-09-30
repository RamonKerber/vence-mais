import { NavLink, useNavigate } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();

  function sair() {
    localStorage.removeItem('token');
    navigate('/');
  }

  return (
    <aside className="sidebar">
      <h1>Vence+</h1>

      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink>

        <NavLink to="/produtos">Produtos</NavLink>
        <NavLink to="/categorias">Categorias</NavLink>
        <NavLink to="/fornecedores">Fornecedores</NavLink>
        <NavLink to="/lotes">Lotes</NavLink>
        <NavLink to="/descartes">Descartes</NavLink>
        <NavLink to="/alertas">Alertas</NavLink>
        <NavLink to="/relatorios">Relatórios</NavLink>
        
      </nav>

      <button onClick={sair}>Sair</button>
    </aside>
  );
}

export default Sidebar;