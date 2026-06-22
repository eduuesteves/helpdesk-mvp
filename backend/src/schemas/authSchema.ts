import { z } from 'zod';

// Esquema com as regras para o cadastro de um novo usuário
export const registerSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Insira um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['ADMIN', 'EMPLOYEE']).optional()
});

// Esquema com as regras para a realização do login
export const loginSchema = z.object({
  email: z.string().email('Insira um e-mail válido'),
  password: z.string().min(1, 'A senha é obrigatória')
});