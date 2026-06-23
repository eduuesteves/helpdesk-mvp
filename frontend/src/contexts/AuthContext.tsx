import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../services/api";

interface User {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "EMPLOYEE";
}

interface AuthContextType {
    signed: boolean;
    user: User | null;
    loading: boolean;
    signIn: (data: SignInData) => Promise<void>;
    signOut: () => void;
}

interface SignInData {
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ao carregar a aplicação, checa se já existe um usuário salvo no navegador
        const storagedUser = localStorage.getItem("@Helpdesk:user");
        const storagedToken = localStorage.getItem("@Helpdesk:token");

        if (storagedUser && storagedToken) {
            setUser(JSON.parse(storagedUser));
        }
        setLoading(false);
    }, []);

    async function signIn({ email, password }: SignInData) {
  try {
    // 🔍 LOG 1: Ver o que o front está prestes a enviar
    console.log("Enviando dados para o login:", { email, password });

    // NOTA: Se o seu backend original usava apenas '/login' (sem o /auth),
    // e o seu axios já tem '/api' no baseURL, esta linha abaixo chama '/api/auth/login'.
    const response = await api.post('/login', { email, password });

    const { token, user } = response.data;
    localStorage.setItem('@helpdesk:token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);

  } catch (error: any) {
    // 🔍 DIAGNÓSTICO EM TEMPO REAL:
    const status = error.response?.status; // Ex: 404, 400, 411, 500
    const backendError = error.response?.data; // A mensagem real do Zod ou do Postgres

    console.error("Erro completo interceptado:", error.response);
    
    // Isto vai abrir um pop-up na sua tela explicando o mistério:
    alert(`🚨 ALERTA DE DEBUG TRACE:\nStatus HTTP: ${status}\nResposta do Servidor: ${JSON.stringify(backendError)}`);
    
    throw error;
  }
}

    function signOut() {
        localStorage.removeItem("@Helpdesk:user");
        localStorage.removeItem("@helpdesk:token");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook customizado para facilitar o uso do contexto nas telas
export function useAuth() {
    return useContext(AuthContext);
}