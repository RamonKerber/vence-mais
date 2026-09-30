import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import Dashboard from './pages/Dashboard';
import './App.css';
import Produtos from './pages/Produtos';
import Categorias from './pages/Categorias';
import Fornecedores from './pages/Fornecedores';
import Lotes from './pages/Lotes';
import Descartes from './pages/Descartes';
import Relatorios from './pages/Relatorios';
import Alertas from './pages/Alertas';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  async function fazerLogin(event) {
    event.preventDefault();

    try {
      const resposta = await axios.post(
        'http://localhost:3000/auth/login',
        { email, senha }
      );

      localStorage.setItem('token', resposta.data.token);

      window.location.href = '/dashboard';
    } catch (erro) {
      setMensagem(
        erro.response?.data?.mensagem || 'Erro ao realizar login.'
      );
    }
  }

  return (
    <div className="pagina-login">
      <div className="login-card">
        <h1>Vence+</h1>

        <p className="subtitulo">
          Gestão de validade e redução de desperdícios
        </p>

        <form onSubmit={fazerLogin}>
          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <button type="submit">Entrar</button>
        </form>

        {mensagem && <p className="mensagem">{mensagem}</p>}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            localStorage.getItem('token')
              ? <Dashboard />
              : <Navigate to="/" />
          }
        />

        <Route
          path="/produtos"
          element={
            localStorage.getItem('token')
              ? <Produtos />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/categorias"
          element={
            localStorage.getItem('token')
              ? <Categorias />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/fornecedores"
          element={
            localStorage.getItem('token')
            ? <Fornecedores />
            : <Navigate to="/" />
          }
        />
        <Route
          path="/lotes"
          element={
            localStorage.getItem('token')
              ? <Lotes />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/descartes"
          element={
            localStorage.getItem('token')
              ? <Descartes />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/relatorios"
          element={
            localStorage.getItem('token')
              ? <Relatorios />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/alertas"
          element={
            localStorage.getItem('token')
              ? <Alertas />
              : <Navigate to="/" />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;