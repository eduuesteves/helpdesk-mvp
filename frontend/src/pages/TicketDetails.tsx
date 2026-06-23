import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../services/api';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_role: string;
}

interface TicketDetailsProps {
  ticket: Ticket;
  onBack: () => void;
}

export function TicketDetails({ ticket, onBack }: TicketDetailsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [status, setStatus] = useState(ticket.status);
  const [submitting, setSubmitting] = useState(false);
  
  // Estado para controlar a abertura do Menu Dropdown Apple Customizado
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isDarkMode = localStorage.getItem('@helpdesk:theme') === 'dark';

  // TOKENS DE DESIGN PREMIUM APPLE
  const theme = {
    bg: isDarkMode ? '#000000' : '#f5f5f7',
    card: isDarkMode ? '#1c1c1e' : '#ffffff',
    text: isDarkMode ? '#f5f5f7' : '#1d1d1f',
    textMuted: isDarkMode ? '#86868b' : '#6e6e73',
    border: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    inputBg: isDarkMode ? '#2c2c2e' : '#f5f5f7',
    shadow: isDarkMode ? '0 12px 30px rgba(0,0,0,0.8)' : '0 8px 24px rgba(0,0,0,0.02)',
    dropdownHover: isDarkMode ? '#2c2c2e' : '#f5f5f7'
  };

  // 1. BLINDAGEM DE BACKGROUND: Força o corpo inteiro do navegador a sincronizar o tema
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = theme.bg;
    
    return () => {
      document.body.style.backgroundColor = originalBg; // Reseta ao desmontar
    };
  }, [isDarkMode, theme.bg]);

  useEffect(() => {
    async function loadTicketData() {
      try {
        const response = await api.get(`/tickets/${ticket.id}/comments`);
        setComments(response.data);
      } catch (error) {
        alert('Erro ao carregar a linha do tempo.');
      }
    }
    loadTicketData();
  }, [ticket.id]);

  async function handleUpdateStatus(newStatus: Ticket['status']) {
    try {
      await api.put(`/tickets/${ticket.id}`, { status: newStatus });
      setStatus(newStatus);
      setIsDropdownOpen(false); // Fecha o menu
      
      // Atualiza timeline para registrar a alteração do sistema
      const refreshComments = await api.get(`/tickets/${ticket.id}/comments`);
      setComments(refreshComments.data);
    } catch (error) {
      alert('Não foi possível atualizar o status.');
    }
  }

  async function handleAddComment(e: FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/tickets/${ticket.id}/comments`, { content: newComment });
      setNewComment('');
      
      const refreshComments = await api.get(`/tickets/${ticket.id}/comments`);
      setComments(refreshComments.data);
    } catch (error) {
      alert('Erro ao enviar mensagem.');
    } finally {
      setSubmitting(false);
    }
  }

  const formatTimeElapsed = (dateString: string) => {
    const created = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diffInHours = Math.floor((now - created) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Criado recentemente';
    if (diffInHours === 1) return 'Criado há 1 hora';
    return `Criado há ${diffInHours} horas`;
  };

  const getStatusLabel = (currentStatus: Ticket['status']) => {
    switch (currentStatus) {
      case 'OPEN': return '🟢 Aberto';
      case 'IN_PROGRESS': return '🟠 Em Triagem';
      case 'RESOLVED': return '⚫ Resolvido';
    }
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', color: theme.text, letterSpacing: '-0.022em', minHeight: '100vh', backgroundColor: theme.bg, transition: 'background-color 0.2s' }}>
      
      {/* CSS ACELERADO POR HARDWARE */}
      <style>{`
        @keyframes appleCanvasEntrance {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .details-container { animation: appleCanvasEntrance 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        
        .apple-back-btn { background: none; border: none; color: #0071e3; font-weight: 500; font-size: 0.95rem; cursor: pointer; transition: opacity 0.2s; display: flex; align-items: center; gap: 4px; padding: 0; }
        .apple-back-btn:hover { opacity: 0.65; }

        .apple-btn-primary { background-color: #0071e3; color: #ffffff; border: none; border-radius: 8px; padding: 0.65rem 1.5rem; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
        .apple-btn-primary:hover { filter: brightness(1.1); transform: translateY(-0.5px); }
        .apple-btn-primary:active { transform: scale(0.97); }

        /* Menu de Contexto Customizado Apple Style */
        .apple-menu-trigger { background-color: ${theme.card}; color: ${theme.text}; border: 1px solid ${theme.border}; padding: 0.5rem 1.25rem; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: ${theme.shadow}; transition: all 0.2s; }
        .apple-menu-trigger:hover { background-color: ${theme.inputBg}; }
        
        .apple-dropdown-menu { position: absolute; right: 0; top: calc(100% + 6px); background-color: ${theme.card}; border: 1px solid ${theme.border}; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); padding: 4px; z-index: 100; min-width: 160px; display: flex; flex-direction: column; gap: 2px; }
        .apple-dropdown-item { text-align: left; background: none; border: none; color: ${theme.text}; padding: 0.6rem 1rem; font-size: 0.85rem; font-weight: 500; cursor: pointer; border-radius: 6px; transition: background 0.15s; width: 100%; }
        .apple-dropdown-item:hover { background-color: #0071e3; color: #ffffff; }

        /* Timeline de Leitura Fluida */
        .premium-timeline { position: relative; display: flex; flex-direction: column; gap: 2rem; margin-top: 1rem; }
        .premium-timeline::before { content: ''; position: absolute; left: 15px; top: 8px; bottom: 8px; width: 2px; background-color: ${theme.border}; z-index: 1; }
        
        .timeline-row { display: flex; gap: 1.5rem; position: relative; z-index: 2; }
        .timeline-bullet { width: 32px; height: 32px; border-radius: 50%; background-color: ${theme.card}; border: 2px solid ${theme.border}; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; box-shadow: ${theme.shadow}; transition: transform 0.2s; }
        .timeline-row:hover .timeline-bullet { transform: scale(1.1); border-color: #0071e3; }
        
        .timeline-content-card { flex: 1; background-color: ${theme.inputBg}; border: 1px solid ${theme.border}; border-radius: 12px; padding: 1.25rem 1.5rem; word-break: break-word; overflow-wrap: break-word; min-width: 0; box-shadow: inset 0 1px 2px rgba(0,0,0,0.01); }
      `}</style>

      <div className="details-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 2rem' }}>
        
        {/* Top Control Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <button onClick={onBack} className="apple-back-btn">
            ‹ Central de Casos
          </button>
          
          {/* Menu Dropdown Controlado */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="apple-menu-trigger">
              <span>{getStatusLabel(status)}</span>
              <span style={{ fontSize: '0.65rem', color: theme.textMuted }}>▼</span>
            </button>

            {isDropdownOpen && (
              <div className="apple-dropdown-menu">
                <button onClick={() => handleUpdateStatus('OPEN')} className="apple-dropdown-item">🟢 Aberto</button>
                <button onClick={() => handleUpdateStatus('IN_PROGRESS')} className="apple-dropdown-item">🟠 Em Triagem</button>
                <button onClick={() => handleUpdateStatus('RESOLVED')} className="apple-dropdown-item">⚫ Resolvido</button>
              </div>
            )}
          </div>
        </div>

        {/* LAYOUT SPLIT-VIEW APPLE */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', alignItems: 'start' }}>
          
          {/* COLUNA ESQUERDA: Linha de Trabalho */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Bloco de Conteúdo Principal */}
            <div style={{ backgroundColor: theme.card, borderRadius: '14px', padding: '2.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0071e3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Caso #{ticket.id.slice(0,8)}</span>
              <h2 style={{ margin: '0.5rem 0 1.5rem 0', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.03em' }}>{ticket.title}</h2>
              <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.65', color: theme.text, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {ticket.description}
              </p>
            </div>

            {/* Linha do Tempo Renovada para Textos Longos (Premium Feed) */}
            <div style={{ backgroundColor: theme.card, borderRadius: '14px', padding: '2.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
              <h3 style={{ margin: '0 0 2rem 0', fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.022em' }}>Histórico Interativo</h3>

              {comments.length === 0 ? (
                <p style={{ color: theme.textMuted, fontSize: '0.95rem', margin: 0 }}>Nenhuma interação registrada.</p>
              ) : (
                <div className="premium-timeline">
                  {comments.map(comment => {
                    const isSystem = comment.content.startsWith('🤖');
                    return (
                      <div key={comment.id} className="timeline-row">
                        {/* Bullet Redondo com Ícone Inteligente */}
                        <div className="timeline-bullet" style={{ color: isSystem ? theme.textMuted : '#0071e3' }}>
                          {isSystem ? '⚙️' : '👤'}
                        </div>
                        
                        {/* Card do Conteúdo à prova de vazamento de texto extenso */}
                        <div className="timeline-content-card" style={{ borderLeft: isSystem ? `3px solid ${theme.textMuted}` : '1px solid ' + theme.border }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: isSystem ? theme.textMuted : theme.text }}>
                              {isSystem ? 'Serviço de Auditoria Automatizado' : comment.name || comment.user_name}
                              {!isSystem && <span style={{ fontWeight: 400, color: theme.textMuted, fontSize: '0.8rem' }}> • {comment.user_role}</span>}
                            </span>
                            <span style={{ color: theme.textMuted, fontSize: '0.8rem' }}>
                              {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: theme.text, whiteSpace: 'pre-wrap' }}>
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Input Box Clean */}
              <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '3rem', borderTop: `1px solid ${theme.border}`, paddingTop: '2.5rem' }}>
                <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Inserir nota de acompanhamento..." required rows={3} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'none' }} />
                <button type="submit" disabled={submitting} className="apple-btn-primary">
                  {submitting ? 'Salvando...' : 'Adicionar Nota'}
                </button>
              </form>
            </div>
          </div>

          {/* COLUNA DIREITA: Painel Inspetor Mac Style */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>
            <div style={{ backgroundColor: theme.card, borderRadius: '14px', padding: '1.75rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
              <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '0.8rem', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Propriedades</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>NÍVEL DE SLA</span>
                  <span style={{ display: 'inline-block', fontSize: '0.8rem', fontWeight: 700, padding: '0.35rem 0.65rem', borderRadius: '6px', backgroundColor: isDarkMode ? 'rgba(255,69,58,0.15)' : '#ffebe6', color: '#ff453a' }}>
                    🚨 Prioridade Crítica
                  </span>
                </div>

                <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '1rem' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>TEMPO DE CURSO</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: theme.text }}>
                    {formatTimeElapsed(ticket.created_at)}
                  </span>
                </div>

                <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '1rem' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.35rem' }}>SEGURANÇA CORPORATIVA</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: theme.text }}>
                    🛡️ Criptografia Tenant Ativa
                  </span>
                </div>
              </div>
            </div>
          </aside>

        </div>

      </div>
    </div>
  );
}