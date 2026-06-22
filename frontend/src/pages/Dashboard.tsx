import { useEffect, useState, FormEvent } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { TicketDetails } from './TicketDetails';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  created_at: string;
  creator_name?: string;
}

type FilterType = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'; // Tipagem do filtro

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do formulário
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Estados de navegação e filtros
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterType>('ALL'); // <-- Novo Estado de Filtro

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

  async function handleCreateTicket(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.post('/tickets', { title: newTitle, description: newDescription });
      setTickets([response.data, ...tickets]);
      setNewTitle('');
      setNewDescription('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao abrir o chamado.');
    } finally {
      setSubmitting(false);
    }
  }

  // Lógica 80/20: Filtra os tickets na memória antes de renderizar a tabela
  const filteredTickets = filterStatus === 'ALL' 
    ? tickets 
    : tickets.filter(ticket => ticket.status === filterStatus);

  function getStatusStyle(status: Ticket['status']) {
    switch (status) {
      case 'OPEN': return { backgroundColor: '#e3f2fd', color: '#0d47a1' };
      case 'IN_PROGRESS': return { backgroundColor: '#fff3e0', color: '#e65100' };
      case 'RESOLVED': return { backgroundColor: '#e8f5e9', color: '#1b5e20' };
    }
  }

  if (selectedTicket) {
    return (
      <TicketDetails 
        ticket={selectedTicket} 
        onBack={() => {
          setSelectedTicket(null);
          api.get('/tickets').then(res => setTickets(res.data));
        }} 
      />
    );
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

      {user?.role === 'EMPLOYEE' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Abrir Novo Chamado</h3>
          <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Título do Problema</label>
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex: Impressora do RH não liga" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Descrição Detalhada</label>
              <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Descreva o que aconteceu..." required rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>
            <button type="submit" disabled={submitting} style={{ alignSelf: 'flex-start', padding: '0.6rem 1.5rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Enviando...' : 'Criar Chamado'}
            </button>
          </form>
        </div>
      )}

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Lista de Chamados</h3>

        {/* Interface de Abas/Filtros */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #dee2e6', paddingBottom: '0.75rem' }}>
          {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as FilterType[]).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                cursor: 'pointer',
                fontWeight: 'bold',
                backgroundColor: filterStatus === status ? '#0070f3' : '#fff',
                color: filterStatus === status ? '#fff' : '#495057',
                borderColor: filterStatus === status ? '#0070f3' : '#ccc',
                transition: 'all 0.1s ease-in-out'
              }}
            >
              {status === 'ALL' ? 'Todos' : status}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Carregando chamados...</p>
        ) : filteredTickets.length === 0 ? ( // <-- Checa se o array filtrado está vazio
          <p style={{ color: '#6c757d', textAlign: 'center', padding: '2rem' }}>Nenhum chamado neste status.</p>
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
              {filteredTickets.map(ticket => ( // <-- Mapeia em cima do array filtrado
                <tr 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket)}
                  style={{ borderBottom: '1px solid #dee2e6', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '1rem 0.75rem', fontWeight: 'bold', color: '#0070f3' }}>{ticket.title}</td>
                  <td style={{ padding: '1rem 0.75rem', color: '#495057', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.description}</td>
                  {user?.role === 'ADMIN' && <td style={{ padding: '1rem 0.75rem' }}>{user.name}</td>}
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