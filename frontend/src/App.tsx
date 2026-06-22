import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard'; // <-- Importando o Dashboard real

function MainApp() {
  const { signed, loading } = useAuth();

  if (loading) {
    return <div style={{ fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>Carregando aplicação...</div>;
  }

  if (!signed) {
    return <Login />;
  }

  // Renderiza o componente Dashboard completo
  return <Dashboard />;
}

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}