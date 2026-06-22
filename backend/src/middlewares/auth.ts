import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Estendendo o Request padrão do Express para incluir os dados do usuário logado
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
    }
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    
    // Token geralmente vem no formato: "Bearer ..."
    const authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.status(401).json({ error: "Token não fornecido" });
    }

    // Separa a palavra "Bearer" do token em si
    const [, token] = authHeader.split(" ");

    try {
        // Valida o token com a mesm senha secreta usada no login
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        // Injeta os dados decodificados (id e role) dentro da requisição
        req.user = decoded as { id: string; role: string };

        // Manda a requisição seguir em frente para o Controller
        return next();
    } catch(error) {
        return res.status(401).json({ error: "Token inválido ou expirado" });
    }
}