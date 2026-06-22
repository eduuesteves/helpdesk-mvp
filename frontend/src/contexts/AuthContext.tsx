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
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
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

    async function signIn(email: string, password: string) {
       // Faz a chamada para o endpoint de login que criamos no backend
       const response = await api.post("/login", { email, password });
       const { user: loggedUser, token } = response.data;

       setUser(loggedUser);
       
       // Salva os dados de forma persistente no navegador
       localStorage.setItem("@Helpdesk:user", JSON.stringify(loggedUser));
       localStorage.setItem("@Helpdesk:token", token);
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