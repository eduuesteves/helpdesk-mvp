import { z } from 'zod';

export const createTicketSchema = z.object({
  title: z.string().min(5, 'O título do chamado deve ter pelo menos 5 caracteres').max(150, 'O título não pode passar de 150 caracteres'),
  description: z.string().min(10, 'Por favor, descreva o problema com pelo menos 10 caracteres')
});

export const updateTicketSchema = z.object({
  // Simplificado para passar a mensagem direta, exatamente como o TypeScript quer
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED'], {
    message: 'Status inválido. Use OPEN, IN_PROGRESS ou RESOLVED'
  }).optional(),
  
  assigned_to: z.string().uuid('ID do atendente inválido').nullable().optional()
});