import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'ADMIN' | 'EMPLOYEE';
    company_id: string; // <-- Novo campo obrigatório do inquilino
  };
}

interface TokenPayload {
  id: string;
  role: 'ADMIN' | 'EMPLOYEE';
  company_id: string;
  iat: number;
  exp: number;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
    
    const authReq = req as AuthenticatedRequest;
    authReq.user = {
      id: decoded.id,
      role: decoded.role,
      company_id: decoded.company_id // <-- Injeta o ID da empresa na requisição
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}