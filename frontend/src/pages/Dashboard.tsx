import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  created_at: string;
  creator_name?: string; // Só virá se for ADMIN
}

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      try {
        const response = await api.get('/tickets');
        setTickets(response.data);
      } catch (error) {
        alert('Erro ao carregar os chamados.');
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  // Função auxiliar 80/20 para estilizar as badges de status
  function getStatusStyle(status: Ticket['status']) {
    switch (status) {
      case 'OPEN': return { backgroundColor: '#e3f2fd', color: '#0d47a1' };
      case 'IN_PROGRESS': return { backgroundColor: '#fff3e0', color: '#e65100' };
      case 'RESOLVED': return { backgroundColor: '#e8f5e9', color: '#1b5e20' };
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #dee2e6', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#212529' }}>Helpdesk Central</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#6c757d' }}>Olá, <strong>{user?.name}</strong> | Nível: {user?.role}</p>
        </div>
        <button onClick={signOut} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          Sair do Sistema
        </button>
      </header>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Lista de Chamados</h3>

        {loading ? (
          <p>Carregando chamados...</p>
        ) : tickets.length === 0 ? (
          <p style={{ color: '#6c757d', textAlign: 'center', padding: '2rem' }}>Nenhum chamado encontrado.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #dee2e6', color: '#495057' }}>
                <th style={{ padding: '0.75rem' }}>Título</th>
                <th style={{ padding: '0.75rem' }}>Descrição</th>
                {user?.role === 'ADMIN' && <th style={{ padding: '0.75rem' }}>Criado Por</th>}
                <th style={{ padding: '0.75rem' }}>Data</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets?.map(ticket => (
                <tr key={ticket.id} style={{ borderBottom: '1px solid #dee2e6', id: 'ticket-row' }}>
                  <td style={{ padding: '1rem 0.75rem', fontWeight: 'bold' }}>{ticket.title}</td>
                  <td style={{ padding: '1rem 0.75rem', color: '#495057', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.description}</td>
                  {user?.role === 'ADMIN' && <td style={{ padding: '1rem 0.75rem' }}>{ticket.creator_name || 'Desconhecido'}</td>}
                  <td style={{ padding: '1rem 0.75rem', color: '#6c757d' }}>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <span style={{ padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', ...getStatusStyle(ticket.status) }}>
                      {ticket.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}