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

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

type FilterType = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos formulários
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  // Estados de filtros
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const ticketsResponse = await api.get('/tickets');
        setTickets(ticketsResponse.data);

        if (user?.role === 'ADMIN') {
          const teamResponse = await api.get('/users/team');
          setTeam(teamResponse.data);
        }
      } catch (error) {
        alert('Erro ao carregar dados do painel.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user?.role]);

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
      // REGRA DE NEGÓCIO: Captura o erro 403 de limite do plano vindo do backend
      alert(error.response?.data?.error || 'Erro ao abrir chamado.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateEmployee(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!empName.trim() || !empEmail.trim() || !empPassword.trim()) return;

    setCreatingUser(true);
    try {
      const response = await api.post('/users/employee', { name: empName, email: empEmail, password: empPassword });
      alert('Membro adicionado com sucesso!');
      setTeam([...team, response.data]);
      setEmpName('');
      setEmpEmail('');
      setEmpPassword('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao registrar funcionário.');
    } finally {
      setCreatingUser(false);
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'ALL' || ticket.status === filterStatus;
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalOpen = tickets.filter(t => t.status === 'OPEN').length;
  const totalInProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const totalResolved = tickets.filter(t => t.status === 'RESOLVED').length;

  // LÓGICA 80/20 FRONTIER: Cálculo de consumo do plano em tempo de execução
  const activeTicketsCount = totalOpen + totalInProgress;
  const isPlanLimitReached = activeTicketsCount >= 5;

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
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '1.25rem 2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>⚡ Helpdesk Pro</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Organização B2B ativa | Operador: <strong style={{ color: '#334155' }}>{user?.name}</strong> ({user?.role})</p>
        </div>
        <button onClick={signOut} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Sair</button>
      </header>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Abertos</span>
          <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2.25rem', fontWeight: 700 }}>{totalOpen}</h2>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Em Triagem</span>
          <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2.25rem', fontWeight: 700 }}>{totalInProgress}</h2>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Finalizados</span>
          <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2.25rem', fontWeight: 700 }}>{totalResolved}</h2>
        </div>
      </div>

      {/* ZONA DO COLABORADOR (CRIAR TICKETS COM TRAVA DE PLANO) */}
      {user?.role === 'EMPLOYEE' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Novo Chamado de Suporte</h3>
            {/* Indicador visual de uso do plano */}
            <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '20px', backgroundColor: isPlanLimitReached ? '#fee2e2' : '#f1f5f9', color: isPlanLimitReached ? '#dc2626' : '#475569' }}>
              Uso do Plano: <strong>{activeTicketsCount} de 5</strong> chamados ativos
            </span>
          </div>

          {/* Banner de Aviso de Bloqueio */}
          {isPlanLimitReached && (
            <div style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem', color: '#c2410c', fontSize: '0.9rem', fontWeight: 500 }}>
              ⚠️ <strong>Limite do plano gratuito atingido!</strong> Sua empresa atingiu o teto de 5 chamados simultâneos ativos. Peça ao administrador para realizar o upgrade para o plano <strong>PRO</strong>.
            </div>
          )}

          <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} disabled={isPlanLimitReached} placeholder={isPlanLimitReached ? "Criação bloqueada pelo plano" : "Título do problema..."} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: isPlanLimitReached ? '#f8fafc' : '#fff' }} />
            <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} disabled={isPlanLimitReached} placeholder={isPlanLimitReached ? "Faça o upgrade para liberar novos chamados" : "Descreva os detalhes..."} required rows={3} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit', backgroundColor: isPlanLimitReached ? '#f8fafc' : '#fff' }} />
            
            <button type="submit" disabled={submitting || isPlanLimitReached} style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem', backgroundColor: isPlanLimitReached ? '#cbd5e1' : '#0f172a', color: isPlanLimitReached ? '#94a3b8' : '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: isPlanLimitReached ? 'not-allowed' : 'pointer' }}>
              {submitting ? 'Criando...' : 'Criar Ticket'}
            </button>
          </form>
        </div>
      )}

      {/* ZONA DO ADMIN (GESTÃO DE EQUIPA) */}
      {user?.role === 'ADMIN' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', alignItems: 'start' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: 700 }}>👥 Expandir Equipa</h3>
            <form onSubmit={handleCreateEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" value={empName} onChange={e => setEmpName(e.target.value)} placeholder="Nome do Funcionário" required style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <input type="email" value={empEmail} onChange={e => setEmpEmail(e.target.value)} placeholder="E-mail Corporativo" required style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <input type="password" value={empPassword} onChange={e => setEmpPassword(e.target.value)} placeholder="Senha Inicial" required style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <button type="submit" disabled={creatingUser} style={{ padding: '0.7rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Adicionar Membro</button>
            </form>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', border: '1px solid #e2e8f0', maxHeight: '290px', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: 700 }}>Membros Ativos ({team.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {team.map(member => (
                <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{member.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{member.email}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: member.role === 'ADMIN' ? '#fef3c7' : '#e2e8f0', color: member.role === 'ADMIN' ? '#92400e' : '#475569' }}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TABELA DE TICKETS */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: '#f1f5f9', padding: '0.35rem', borderRadius: '8px' }}>
            {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as FilterType[]).map(status => (
              <button key={status} onClick={() => setFilterStatus(status)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', backgroundColor: filterStatus === status ? '#fff' : 'transparent', color: filterStatus === status ? '#0f172a' : '#64748b', boxShadow: filterStatus === status ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
                {status === 'ALL' ? 'Todos' : status}
              </button>
            ))}
          </div>
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="🔍 Buscar por palavra-chave..." style={{ width: '100%', maxWidth: '320px', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
        </div>

        {loading ? (
          <p style={{ color: '#64748b' }}>Carregando dados estruturados...</p>
        ) : filteredTickets.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>Nenhum chamado encontrado.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #edf2f7', color: '#475569', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem 0.75rem' }}>Caso</th>
                {user?.role === 'ADMIN' && <th style={{ padding: '1rem 0.75rem' }}>Solicitante</th>}
                <th style={{ padding: '1rem 0.75rem' }}>Data</th>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <td style={{ padding: '1.25rem 0.75rem' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{ticket.title}</div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.description}</div>
                  </td>
                  {user?.role === 'ADMIN' && <td style={{ padding: '1.25rem 0.75rem', color: '#334155', fontSize: '0.9rem' }}>{ticket.creator_name}</td>}
                  <td style={{ padding: '1.25rem 0.75rem', color: '#64748b', fontSize: '0.9rem' }}>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding: '1.25rem 0.75rem', textAlign: 'right' }}>
                    <span style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, ...getStatusStyle(ticket.status) }}>{ticket.status}</span>
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