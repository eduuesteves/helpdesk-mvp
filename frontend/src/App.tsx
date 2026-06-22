import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';

function MainApp() {
  const { signed, user, signOut } = useAuth();

  // Se o usuário não estiver logado, exibe apenas a tela de Login
  if (!signed) {
    return <Login />;
  }

  // Se estiver logado, exibe o "Dashboard" provisório
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <h2>Painel do Helpdesk</h2>
        <div>
          <span style={{ marginRight: '1rem' }}>Olá, <strong>{user?.name}</strong> ({user?.role})</span>
          <button onClick={signOut} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Sair</button>
        </div>
      </header>
      <main style={{ marginTop: '2rem' }}>
        <p>Você está autenticado com sucesso! Próximo passo: Listar os chamados aqui.</p>
      </main>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}