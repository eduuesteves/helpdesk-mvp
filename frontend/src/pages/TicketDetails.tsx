import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_role: 'ADMIN' | 'EMPLOYEE';
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  created_at: string;
  creator_name?: string;
}

interface TicketDetailsProps {
  ticket: Ticket;
  onBack: () => void;
}

export function TicketDetails({ ticket, onBack }: TicketDetailsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [status, setStatus] = useState(ticket.status);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    async function loadComments() {
      try {
        const response = await api.get(`/tickets/${ticket.id}/comments`);
        setComments(response.data);
      } catch (error) {
        alert('Erro ao carregar comentários.');
      } finally {
        setLoadingComments(false);
      }
    }
    loadComments();
  }, [ticket.id]);

  async function handleStatusChange(newStatus: string) {
    try {
      await api.patch(`/tickets/${ticket.id}`, { status: newStatus });
      setStatus(newStatus as Ticket['status']);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao atualizar status.');
    }
  }

  async function handleAddComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await api.post(`/tickets/${ticket.id}/comments`, { content: newComment });
      
      // Como o backend não retorna o nome do usuário no POST (apenas o id), criamos o objeto local completo
      const freshComment: Comment = {
        id: response.data.id,
        content: response.data.content,
        created_at: response.data.created_at,
        user_name: user?.name || 'Eu',
        user_role: user?.role || 'EMPLOYEE'
      };

      setComments([...comments, freshComment]);
      setNewComment('');
    } catch (error) {
      alert('Erro ao enviar comentário.');
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <button onClick={onBack} style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold' }}>
        ← Voltar para a Lista
      </button>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0 }}>{ticket.title}</h2>
            <p style={{ color: '#6c757d', margin: '0.5rem 0 0 0' }}>Criado em: {new Date(ticket.created_at).toLocaleString('pt-BR')}</p>
          </div>
          
          {/* Controle RBAC de Status: ADMIN vê select, EMPLOYEE vê apenas texto fixo */}
          {user?.role === 'ADMIN' ? (
            <div>
              <label style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Alterar Status:</label>
              <select value={status} onChange={e => handleStatusChange(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>
          ) : (
            <span style={{ padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold', backgroundColor: '#e3f2fd', color: '#0d47a1' }}>
              Status: {status}
            </span>
          )}
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', lineHeight: '1.6', color: '#333', backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '4px' }}>
          {ticket.description}
        </p>
      </div>

      {/* Seção da Timeline / Histórico de Conversas */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3>Timeline de Atendimento</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {loadingComments ? (
            <p>Carregando histórico...</p>
          ) : comments.length === 0 ? (
            <p style={{ color: '#6c757d', textAlign: 'center' }}>Nenhuma mensagem enviada ainda.</p>
          ) : (
            comments.map(c => (
              <div key={c.id} style={{ padding: '1rem', borderRadius: '6px', backgroundColor: c.user_role === 'ADMIN' ? '#f0fdf4' : '#f8fafc', borderLeft: c.user_role === 'ADMIN' ? '4px solid #16a34a' : '4px solid #64748b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                  <strong>{c.user_name} ({c.user_role})</strong>
                  <span>{new Date(c.created_at).toLocaleString('pt-BR')}</span>
                </div>
                <p style={{ margin: 0, color: '#334155' }}>{c.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Formulário de Envio de Nova Mensagem */}
        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '1rem' }}>
          <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Digite sua resposta ou atualização sobre o caso..." required style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
          <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            Responder
          </button>
        </form>
      </div>
    </div>
  );
}