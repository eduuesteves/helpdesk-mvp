import { useEffect, useState, type FormEvent } from 'react';
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

type FilterType = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do formulário
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Estados de filtros avançados
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

    
    const [empName, setEmpName] = useState('');
    const [empEmail, setEmpEmail] = useState('');
    const [empPassword, setEmpPassword] = useState('');
    const [creatingUser, setCreatingUser] = useState(false);

    async function handleCreateEmployee(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!empName.trim() || !empEmail.trim() || !empPassword.trim()) return;

    setCreatingUser(true);
    try {
        await api.post('/users/employee', { name: empName, email: empEmail, password: empPassword });
        alert('Funcionário registado com sucesso! Ele já pode iniciar sessão.');
        setEmpName('');
        setEmpEmail('');
        setEmpPassword('');
    } catch (error: any) {
        alert(error.response?.data?.error || 'Erro ao registar funcionário.');
    } finally {
        setCreatingUser(false);
}
}

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

  // Multi-Filtro Inteligente 80/20: Status AND Termo de Busca
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'ALL' || ticket.status === filterStatus;
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // KPI Computados
  const totalOpen = tickets.filter(t => t.status === 'OPEN').length;
  const totalInProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const totalResolved = tickets.filter(t => t.status === 'RESOLVED').length;

  function getStatusStyle(status: Ticket['status']) {
    switch (status) {
      case 'OPEN': return { backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' };
      case 'IN_PROGRESS': return { backgroundColor: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa' };
      case 'RESOLVED': return { backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' };
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
    <div style={{ fontFamily: '"Inter", system-ui, sans-serif', padding: '2.5rem', backgroundColor: '#f1f5f9', minHeight: '100vh', color: '#0f172a' }}>
      
      {/* HEADER POLIDO */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '1.25rem 2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#1e293b' }}>⚡ Helpdesk Pro</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Conectado como: <strong style={{ color: '#334155' }}>{user?.name}</strong> ({user?.role})</p>
        </div>
        <button onClick={signOut} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fca5a5'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
          Sair
        </button>
      </header>

      {/* KPI CARDS MODERNOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Abertos</span>
          </div>
          <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2.25rem', fontWeight: 700, color: '#1e293b' }}>{totalOpen} <span style={{ fontSize: '1rem', fontWeight: 400, color: '#94a3b8' }}>casos</span></h2>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' }}></span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Em Triagem</span>
          </div>
          <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2.25rem', fontWeight: 700, color: '#1e293b' }}>{totalInProgress} <span style={{ fontSize: '1rem', fontWeight: 400, color: '#94a3b8' }}>atendimentos</span></h2>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Finalizados</span>
          </div>
          <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2.25rem', fontWeight: 700, color: '#1e293b' }}>{totalResolved} <span style={{ fontSize: '1rem', fontWeight: 400, color: '#94a3b8' }}>concluídos</span></h2>
        </div>
      </div>

      {/* FORMULÁRIO ENXUTO (EMPLOYEE) */}
      {user?.role === 'EMPLOYEE' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: 700 }}>Novo Chamado de Suporte</h3>
          <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
              <div>
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Título sumário do problema (ex: Falha na VPN corporativa)" required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', fontSize: '0.95rem' }} />
              </div>
              <div>
                <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Descreva os detalhes do erro, o que aconteceu e mensagens de erro que apareceram na tela..." required rows={3} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'vertical', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit' }} />
              </div>
            </div>
            <button type="submit" disabled={submitting} style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s', fontSize: '0.95rem' }}>
              {submitting ? 'Registrando...' : 'Abrir Ticket'}
            </button>
          </form>
        </div>
      )}
      {user?.role === 'ADMIN' && (
  <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
    <h3 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>👥 Adicionar Colaborador à Equipa</h3>
    <form onSubmit={handleCreateEmployee} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <input type="text" value={empName} onChange={e => setEmpName(e.target.value)} placeholder="Nome do Funcionário" required style={{ flex: 1, minWidth: '200px', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
      <input type="email" value={empEmail} onChange={e => setEmpEmail(e.target.value)} placeholder="E-mail Corporativo" required style={{ flex: 1, minWidth: '200px', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
      <input type="password" value={empPassword} onChange={e => setEmpPassword(e.target.value)} placeholder="Senha Inicial" required style={{ flex: 1, minWidth: '150px', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
      <button type="submit" disabled={creatingUser} style={{ padding: '0.65rem 1.5rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
        {creatingUser ? 'A gravar...' : 'Adicionar Membro'}
      </button>
    </form>
  </div>
)}

      {/* PAINEL DE FILTROS E TABELA */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
        
        {/* CONTROLES INTEGRADOS: ABAS + BARRA DE BUSCA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
          
          {/* Abas */}
          <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: '#f1f5f9', padding: '0.35rem', borderRadius: '8px' }}>
            {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as FilterType[]).map(status => (
              <button key={status} onClick={() => setFilterStatus(status)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', backgroundColor: filterStatus === status ? '#fff' : 'transparent', color: filterStatus === status ? '#0f172a' : '#64748b', boxShadow: filterStatus === status ? '0 1px 3px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.15s' }}>
                {status === 'ALL' ? 'Todos' : status}
              </button>
            ))}
          </div>

          {/* Input de Busca Textual Real-time */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="🔍 Buscar por palavra-chave..." style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>

        </div>

        {/* TABELA PREMIUM */}
        {loading ? (
          <p style={{ color: '#64748b' }}>Carregando dados estruturados...</p>
        ) : filteredTickets.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem 1rem', fontSize: '0.95rem' }}>Nenhum chamado corresponde aos filtros selecionados.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #edf2f7', color: '#475569', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 0.75rem' }}>Caso</th>
                {user?.role === 'ADMIN' && <th style={{ padding: '1rem 0.75rem' }}>Solicitante</th>}
                <th style={{ padding: '1rem 0.75rem' }}>Data de Abertura</th>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <td style={{ padding: '1.25rem 0.75rem' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem', fontSize: '0.95rem' }}>{ticket.title}</div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.description}</div>
                  </td>
                  {user?.role === 'ADMIN' && <td style={{ padding: '1.25rem 0.75rem', color: '#334155', fontSize: '0.9rem', fontWeight: 500 }}>{ticket.creator_name || 'Usuário'}</td>}
                  <td style={{ padding: '1.25rem 0.75rem', color: '#64748b', fontSize: '0.9rem' }}>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding: '1.25rem 0.75rem', textAlign: 'right' }}>
                    <span style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.025em', ...getStatusStyle(ticket.status) }}>
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