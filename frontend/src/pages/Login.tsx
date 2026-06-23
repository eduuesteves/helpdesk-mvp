import { useState, type FormEvent, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Puxa a preferência do usuário ou assume claro para a identidade inicial
  const isDarkMode = localStorage.getItem('@helpdesk:theme') === 'dark';

  const theme = {
    bg: isDarkMode ? '#000000' : '#f5f5f7',
    card: isDarkMode ? '#1c1c1e' : '#ffffff',
    text: isDarkMode ? '#f5f5f7' : '#1d1d1f',
    textMuted: isDarkMode ? '#86868b' : '#6e6e73',
    border: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    inputBg: isDarkMode ? '#2c2c2e' : '#ffffff',
    shadow: isDarkMode ? '0 20px 40px rgba(0,0,0,0.6)' : '0 8px 24px rgba(0,0,0,0.02)'
  };

  // Garante consistência cromática no body do navegador
  useEffect(() => {
    document.body.style.backgroundColor = theme.bg;
  }, [theme.bg]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    try {
      await signIn({ email, password });
    } catch (error) {
      alert('Falha na autenticação. Verifique as credenciais corporativas.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', color: theme.text, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg, padding: '2rem', letterSpacing: '-0.022em' }}>
      
      {/* ENGINE DE ANIMAÇÃO DE HARDWARE APPLE STYLE */}
      <style>{`
        @keyframes appleEntrance {
          from { opacity: 0; transform: scale(0.98) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .login-card {
          animation: appleEntrance 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .apple-input-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .apple-field {
          width: 100%; padding: 0.85rem 1rem; border-radius: 10px; font-size: 0.95rem; outline: none; transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
        }
        /* Efeito de borda inteligente e foco fluido */
        .apple-field:focus {
          border-color: #0071e3 !important;
          box-shadow: 0 0 0 4px ${isDarkMode ? 'rgba(0,113,227,0.15)' : 'rgba(0,113,227,0.1)'} !important;
        }
        .apple-submit {
          width: 100%; padding: 0.85rem; background-color: #0071e3; color: #ffffff; border: none; border-radius: 10px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s;
        }
        .apple-submit:hover { filter: brightness(1.08); }
        .apple-submit:active { transform: scale(0.98); }
        .apple-submit:disabled { background-color: ${theme.border}; color: ${theme.textMuted}; cursor: not-allowed; }
      `}</style>

      {/* CARD CORPORATIVO */}
      <div className="login-card" style={{ width: '100%', maxWidth: '400px', backgroundColor: theme.card, borderRadius: '16px', padding: '3rem 2.5rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
        
        {/* LOGO E SUBTITULO */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em' }}>Helpdesk Central</h2>
          <p style={{ margin: '0.4rem 0 0 0', color: theme.textMuted, fontSize: '0.9rem', fontWeight: 500 }}>Acesse o seu painel organizacional isolado.</p>
        </div>

        {/* FORMULÁRIO DE ENTRADA */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="apple-input-wrapper">
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.textMuted, letterSpacing: '0.03em' }}>E-MAIL CORPORATIVO</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} placeholder="nome@empresa.com" required className="apple-field" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text }} />
          </div>

          <div className="apple-input-wrapper">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.textMuted, letterSpacing: '0.03em' }}>SENHA DE ACESSO</label>
            </div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} placeholder="••••••••" required className="apple-field" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text }} />
          </div>

          <button type="submit" disabled={loading} className="apple-submit" style={{ marginTop: '0.5rem' }}>
            {loading ? 'Validando Credenciais...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>

      {/* FOOTER DE SEGURANÇA */}
      <footer style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: theme.textMuted }}>
        🛡️ Conexão auditada e criptografada ponta a ponta.
      </footer>
    </div>
  );
}