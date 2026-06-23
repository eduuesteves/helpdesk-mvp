import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { TicketDetails } from './TicketDetails';
import { TeamManagement } from '../components/TeamManagement.tsx'; // <-- Novo Componente
import { UserProfile } from '../components/UserProfile.tsx';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  created_at: string;
  creator_name?: string;
}

type FilterType = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
type ViewType = 'tickets' | 'team' | 'profile'; // <-- Controle de Telas do SaaS

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Configuração e Navegação
  const [currentView, setCurrentView] = useState<ViewType>('tickets');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('@helpdesk:theme') === 'dark';
  });

  // Estados do formulário de Chamado
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filtros internos de tickets
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const nextTheme = !prev;
      localStorage.setItem('@helpdesk:theme', nextTheme ? 'dark' : 'light');
      return nextTheme;
    });
  };

  // APPLE SYSTEM PALETTE Tokens (Cores sólidas, sem bordas brancas artificiais no Dark)
  const theme = {
    bg: isDarkMode ? '#000000' : '#f5f5f7', // Fundo puro Apple (Pure Black vs Soft Gray)
    card: isDarkMode ? '#1c1c1e' : '#ffffff', // Cards elevados padrão iOS/macOS
    text: isDarkMode ? '#f5f5f7' : '#1d1d1f', // Texto principal San Francisco contrast
    textMuted: isDarkMode ? '#86868b' : '#6e6e73',
    border: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', // Linhas finas milimétricas
    inputBg: isDarkMode ? '#2c2c2e' : '#f5f5f7',
    tableHover: isDarkMode ? '#2c2c2e' : '#f5f5f7',
    shadow: isDarkMode ? '0 12px 30px rgba(0,0,0,0.7)' : '0 8px 24px rgba(0,0,0,0.04)'
  };

  useEffect(() => {
    async function loadTicketsData() {
      try {
        const response = await api.get('/tickets');
        setTickets(response.data);
      } catch (error) {
        alert('Erro ao carregar dados do painel.');
      } finally {
        setLoading(false);
      }
    }
    loadTicketsData();
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
      alert(error.response?.data?.error || 'Erro ao abrir chamado.');
    } finally {
      setSubmitting(false);
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

  const activeTicketsCount = totalOpen + totalInProgress;
  const isPlanLimitReached = activeTicketsCount >= 5;

  function getStatusStyle(status: Ticket['status']) {
    switch (status) {
      case 'OPEN': return { backgroundColor: isDarkMode ? 'rgba(59,130,246,0.15)' : '#e8f2ff', color: '#0071e3' };
      case 'IN_PROGRESS': return { backgroundColor: isDarkMode ? 'rgba(234,88,12,0.15)' : '#fff0e6', color: '#ff6600' };
      case 'RESOLVED': return { backgroundColor: isDarkMode ? 'rgba(22,163,74,0.15)' : '#e6f7ed', color: '#16a34a' };
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
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", sans-serif', padding: '3rem 4rem', backgroundColor: theme.bg, minHeight: '100vh', color: theme.text, transition: 'background-color 0.3s, color 0.3s' }}>
      
      {/* APPLE ACCELERATED CSS ANIMATIONS */}
      <style>{`
        @keyframes appleFade { from { opacity: 0; transform: scale(0.99) translateY(4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .apple-view { animation: appleFade 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        .interactive-card { transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1); }
        .interactive-card:hover { transform: translateY(-2px); box-shadow: ${isDarkMode ? '0 20px 40px rgba(0,0,0,0.8)' : '0 12px 30px rgba(0,0,0,0.06)'} !important; }
        .interactive-btn { transition: all 0.2s ease; }
        .interactive-btn:hover { filter: brightness(1.08); }
        .interactive-btn:active { transform: scale(0.98); }
        .ticket-row { transition: background-color 0.18s ease, transform 0.18s ease; }
        .ticket-row:hover { background-color: ${theme.tableHover} !important; transform: translateX(2px); }
      `}</style>

      <div className="apple-view">
        
        {/* TOP BAR / NAVIGATION (Estilo Barra Superior Mac) */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', color: theme.textMuted, textTransform: 'uppercase' }}>SaaS Enterprise</span>
            <h1 style={{ margin: '0.2rem 0 0 0', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.022em' }}>Helpdesk Central</h1>
          </div>

          {/* CONTROLADORES DE TELA (Segmented Control Clássico da Apple) */}
          <div style={{ display: 'flex', backgroundColor: isDarkMode ? '#1c1c1e' : 'rgba(0,0,0,0.04)', padding: '4px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
            <button onClick={() => setCurrentView('tickets')} style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', backgroundColor: currentView === 'tickets' ? theme.card : 'transparent', color: currentView === 'tickets' ? theme.text : theme.textMuted, boxShadow: currentView === 'tickets' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
              🎟️ Chamados
            </button>
            {user?.role === 'ADMIN' && (
              <button onClick={() => setCurrentView('team')} style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', backgroundColor: currentView === 'team' ? theme.card : 'transparent', color: currentView === 'team' ? theme.text : theme.textMuted, boxShadow: currentView === 'team' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
                👥 Equipe
              </button>
            )}
            <button onClick={() => setCurrentView('profile')} style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', backgroundColor: currentView === 'profile' ? theme.card : 'transparent', color: currentView === 'profile' ? theme.text : theme.textMuted, boxShadow: currentView === 'profile' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
              👤 Meu Perfil
            </button>
          </div>
          {/* UTILS PANEL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={toggleTheme} className="interactive-btn" style={{ padding: '0.5rem', backgroundColor: theme.card, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: theme.shadow }}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={signOut} className="interactive-btn" style={{ padding: '0.5rem 1.25rem', backgroundColor: theme.card, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', boxShadow: theme.shadow }}>
              Sair
            </button>
          </div>
        </header>

        {/* RENDERIZADOR DINÂMICO DE VISÕES CONTROLANDO O ESCOPO */}
{currentView === 'team' && user?.role === 'ADMIN' && (
  <TeamManagement isDarkMode={isDarkMode} theme={theme} />
)}

{currentView === 'profile' && (
  <UserProfile theme={theme} />
)}

{currentView === 'tickets' && (
  <>
            {/* KPI CARDS - APPLE GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="interactive-card" style={{ backgroundColor: theme.card, padding: '1.75rem', borderRadius: '14px', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Abertos</span>
                <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.03em' }}>{totalOpen}</h2>
              </div>
              <div className="interactive-card" style={{ backgroundColor: theme.card, padding: '1.75rem', borderRadius: '14px', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Em Triagem</span>
                <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.03em' }}>{totalInProgress}</h2>
              </div>
              <div className="interactive-card" style={{ backgroundColor: theme.card, padding: '1.75rem', borderRadius: '14px', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Finalizados</span>
                <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.03em' }}>{totalResolved}</h2>
              </div>
            </div>

            {/* FORMULÁRIO ENXUTO SE FOR EMPLOYEE */}
            {user?.role === 'EMPLOYEE' && (
              <div style={{ backgroundColor: theme.card, borderRadius: '14px', padding: '2.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.022em' }}>Novo Chamado de Suporte</h3>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0.35rem 0.75rem', borderRadius: '20px', backgroundColor: isPlanLimitReached ? 'rgba(239,68,68,0.1)' : theme.bg, color: isPlanLimitReached ? '#dc2626' : theme.textMuted }}>
                    Uso do Plano: {activeTicketsCount} de 5 chamados ativos
                  </span>
                </div>

                {isPlanLimitReached && (
                  <div style={{ backgroundColor: isDarkMode ? '#451a03' : '#fff7ed', border: `1px solid ${isDarkMode ? '#7c2d12' : '#ffedd5'}`, borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: isDarkMode ? '#ffedd5' : '#c2410c', fontSize: '0.9rem' }}>
                    ⚠️ Limite do plano atingido. Faça upgrade para o plano PRO.
                  </div>
                )}

                <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} disabled={isPlanLimitReached} placeholder="Título sumário do problema..." required style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, outline: 'none' }} />
                  <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} disabled={isPlanLimitReached} placeholder="Descreva os detalhes..." required rows={3} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: `1px solid ${theme.border}`, fontFamily: 'inherit', backgroundColor: theme.inputBg, color: theme.text, outline: 'none' }} />
                  <button type="submit" disabled={submitting || isPlanLimitReached} className="interactive-btn" style={{ alignSelf: 'flex-start', padding: '0.85rem 2.5rem', backgroundColor: isPlanLimitReached ? theme.border : '#0071e3', color: isPlanLimitReached ? theme.textMuted : '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: isPlanLimitReached ? 'not-allowed' : 'pointer' }}>
                    Criar Ticket
                  </button>
                </form>
              </div>
            )}

            {/* SEÇÃO PRINCIPAL DE CHAMADOS (DESTAQUE DA APLICAÇÃO) */}
            <div style={{ backgroundColor: theme.card, borderRadius: '14px', padding: '2.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                
                {/* Filtros em Pílulas (Padrão Apple Settings) */}
                <div style={{ display: 'flex', backgroundColor: theme.bg, padding: '4px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                  {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as FilterType[]).map(status => (
                    <button key={status} onClick={() => setFilterStatus(status)} style={{ padding: '0.4rem 0.85rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', backgroundColor: filterStatus === status ? theme.card : 'transparent', color: filterStatus === status ? theme.text : theme.textMuted, boxShadow: filterStatus === status ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
                      {status === 'ALL' ? 'Todos' : status}
                    </button>
                  ))}
                </div>

                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="🔍 Buscar por palavra-chave..." style={{ width: '100%', maxWidth: '280px', padding: '0.55rem 1rem', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, outline: 'none', fontSize: '0.9rem' }} />
              </div>

              {loading ? (
                <p style={{ color: theme.textMuted }}>Carregando dados estruturados...</p>
              ) : filteredTickets.length === 0 ? (
                <p style={{ color: theme.textMuted, textAlign: 'center', padding: '3rem 0' }}>Nenhum chamado listado nesta organização.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.textMuted, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '1rem 0.75rem' }}>Caso</th>
                      {user?.role === 'ADMIN' && <th style={{ padding: '1rem 0.75rem' }}>Solicitante</th>}
                      <th style={{ padding: '1rem 0.75rem' }}>Data</th>
                      <th style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map(ticket => (
                      <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="ticket-row" style={{ borderBottom: `1px solid ${theme.border}`, cursor: 'pointer' }}>
                        <td style={{ padding: '1.25rem 0.75rem' }}>
                          <div style={{ fontWeight: 600, color: theme.text, fontSize: '0.95rem' }}>{ticket.title}</div>
                          <div style={{ color: theme.textMuted, fontSize: '0.85rem', marginTop: '0.15rem', maxWidth: '500px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.description}</div>
                        </td>
                        {user?.role === 'ADMIN' && <td style={{ padding: '1.25rem 0.75rem', color: theme.text, fontSize: '0.9rem', fontWeight: 500 }}>{ticket.creator_name}</td>}
                        <td style={{ padding: '1.25rem 0.75rem', color: theme.textMuted, fontSize: '0.9rem' }}>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</td>
                        <td style={{ padding: '1.25rem 0.75rem', textAlign: 'right' }}>
                          <span style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, ...getStatusStyle(ticket.status) }}>{ticket.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}