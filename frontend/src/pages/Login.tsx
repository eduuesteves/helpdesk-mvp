import { useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { signIn } = useAuth();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");

        try {
            await signIn(email, password);
        } catch (err: any) {
            setError(err.response?.data?.error || "Falha na autenticação. Verifique os dados.");
        }
    }

    return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f8' }}>
      <form onSubmit={handleSubmit} style={{ padding: '2.5rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>Helpdesk Login</h2>
        
        {error && <p style={{ color: 'red', backgroundColor: '#ffebe6', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem' }}>{error}</p>}
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>E-mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Senha</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
        </div>

        <button type="submit" style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          Entrar no Sistema
        </button>
      </form>
    </div>
  );
}