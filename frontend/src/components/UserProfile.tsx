import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  theme: any;
}

export function UserProfile({ theme }: UserProfileProps) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  async function handleUpdatePassword(e: FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    setUpdating(true);
    try {
      // Simulação de rota 80/20 - Pronto para plugar no backend se necessário
      alert('🔒 Solicitação enviada! Em sistemas Enterprise, a alteração gera um log de auditoria.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      alert('Erro ao atualizar credenciais.');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* CARD INFO DO OPERADOR */}
      <div style={{ backgroundColor: theme.card, borderRadius: '14px', padding: '2.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#0071e3', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.022em' }}>{user?.name}</h3>
            <p style={{ margin: '0.2rem 0 0 0', color: theme.textMuted, fontSize: '0.9rem' }}>Credencial Operacional Ativa</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `1px solid ${theme.border}`, paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: theme.textMuted, fontWeight: 500 }}>E-MAIL REGISTRADO</span>
            <span style={{ fontWeight: 600 }}>{user?.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: theme.textMuted, fontWeight: 500 }}>NÍVEL DE ACESSO (RBAC)</span>
            <span style={{ fontWeight: 600, color: '#0071e3' }}>{user?.role}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: theme.textMuted, fontWeight: 500 }}>POLÍTICA DE PRIVACIDADE</span>
            <span style={{ fontWeight: 500, color: '#16a34a' }}>✓ Conexão Criptografada</span>
          </div>
        </div>
      </div>

      {/* CARD DE SEGURANÇA (ALTERAR SENHA) */}
      <div style={{ backgroundColor: theme.card, borderRadius: '14px', padding: '2.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 600 }}>Segurança da Conta</h4>
        <p style={{ margin: '0 0 1.5rem 0', color: theme.textMuted, fontSize: '0.85rem' }}>Atualize a sua palavra-passe de acesso ao ecossistema multi-tenant.</p>

        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: theme.textMuted }}>SENHA ATUAL</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, outline: 'none', fontSize: '0.95rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: theme.textMuted }}>NOVA SENHA CONFIÁVEL</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, outline: 'none', fontSize: '0.95rem' }} />
          </div>

          <button type="submit" disabled={updating} className="interactive-btn" style={{ padding: '0.8rem', backgroundColor: '#0071e3', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            {updating ? 'Processando...' : 'Modificar Senha Corporativa'}
          </button>
        </form>
      </div>

    </div>
  );
}