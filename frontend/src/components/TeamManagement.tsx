import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../services/api';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface TeamManagementProps {
  isDarkMode: boolean;
  theme: any;
}

export function TeamManagement({ isDarkMode, theme }: TeamManagementProps) {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do formulário
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    async function loadTeam() {
      try {
        const response = await api.get('/users/team');
        setTeam(response.data);
      } catch (error) {
        alert('Erro ao carregar membros da equipe.');
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, []);

  async function handleCreateEmployee(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!empName.trim() || !empEmail.trim() || !empPassword.trim()) return;

    setCreatingUser(true);
    try {
      const response = await api.post('/users/employee', { name: empName, email: empEmail, password: empPassword });
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
      
      {/* Formulário - Apple Input Style */}
      <div style={{ backgroundColor: theme.card, borderRadius: '14px', padding: '2.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
        <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.022em' }}>Expandir Organização</h3>
        <p style={{ marginTop: 0, marginBottom: '2rem', color: theme.textMuted, fontSize: '0.9rem' }}>Adicione novos colaboradores diretamente ao ecossistema da sua empresa.</p>
        
        <form onSubmit={handleCreateEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: theme.textMuted }}>NOME COMPLETO</label>
            <input type="text" value={empName} onChange={e => setEmpName(e.target.value)} placeholder="Ex: Lucas Silva" required style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: theme.textMuted }}>E-MAIL CORPORATIVO</label>
            <input type="email" value={empEmail} onChange={e => setEmpEmail(e.target.value)} placeholder="lucas@empresa.com" required style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, outline: 'none', fontSize: '0.95rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: theme.textMuted }}>SENHA INICIAL DE ACESSO</label>
            <input type="password" value={empPassword} onChange={e => setEmpPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, outline: 'none', fontSize: '0.95rem' }} />
          </div>
          
          <button type="submit" disabled={creatingUser} className="interactive-btn" style={{ padding: '0.85rem', backgroundColor: '#0071e3', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            {creatingUser ? 'Salvando...' : 'Convidar Membro'}
          </button>
        </form>
      </div>

      {/* Diretório de Membros - Minimal List */}
      <div style={{ backgroundColor: theme.card, borderRadius: '14px', padding: '2.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
        <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.022em' }}>Membros Ativos</h3>
        <p style={{ marginTop: 0, marginBottom: '2rem', color: theme.textMuted, fontSize: '0.9rem' }}>Controle de acessos e cargos da equipe atual ({team.length}).</p>
        
        {loading ? (
          <p style={{ color: theme.textMuted, fontSize: '0.95rem' }}>Carregando dados da equipe...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', backgroundColor: theme.border, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${theme.border}` }}>
            {team.map(member => (
              <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', backgroundColor: theme.card }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{member.name}</div>
                  <div style={{ fontSize: '0.85rem', color: theme.textMuted, marginTop: '0.1rem' }}>{member.email}</div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.35rem 0.65rem', borderRadius: '6px', backgroundColor: member.role === 'ADMIN' ? (isDarkMode ? '#2d2d2d' : '#f5f5f7') : (isDarkMode ? '#1a2238' : '#e8f2ff'), color: member.role === 'ADMIN' ? theme.text : '#0071e3' }}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}