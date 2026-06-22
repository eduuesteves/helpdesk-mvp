
import { useEffect, useState } from 'react'
import './App.css'
import { api } from './services/api';

export function App() {
  const [status, setStatus] = useState<string>("Carregando...");

  useEffect(() => {
    // Testa a conexão com o nosso backend rodando na porta 3333
    api
      .get("/health")
      .then(response => setStatus(response.data.message))
      .catch(() => setStatus("Erro ao conectar com o Backend ❌"));
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
      <h1>Helpdesk MVP - Frontend</h1>
      <p>Status da API: <strong>{status}</strong></p>
    </div>
  )
}
