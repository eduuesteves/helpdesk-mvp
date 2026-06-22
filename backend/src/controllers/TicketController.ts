import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthenticatedRequest } from '../middlewares/auth';
import { createTicketSchema, updateTicketSchema } from '../schemas/ticketSchema'; // <-- Import

export const TicketController = {
  async create(req: Request, res: Response) {
    try {
      const result = createTicketSchema.safeParse(req.body);

      if (!result.success) {
        const errorMessages = result.error.issues.map(err => err.message);
        return res.status(400).json({ error: errorMessages.join(', ') });
      }

      const authReq = req as AuthenticatedRequest;
      const { title, description } = result.data;
      const userId = authReq.user?.id;

      const newTicket = await pool.query(
        `INSERT INTO tickets (title, description, created_by)
         VALUES ($1, $2, $3)
         RETURNING id, title, description, status, created_by, created_at`,
        [title, description, userId]
      );

      return res.status(201).json(newTicket.rows[0]);
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  },

  async listAll(req: Request, res: Response) {
    // ... mantenha o método listAll exatamente como estava antes ...
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;
      const userRole = authReq.user?.role;
      let result;
      if (userRole === 'ADMIN') {
        result = await pool.query(`SELECT t.id, t.title, t.description, t.status, t.created_at, u.name AS creator_name FROM tickets t JOIN users u ON t.created_by = u.id ORDER BY t.created_at DESC`);
      } else {
        result = await pool.query(`SELECT id, title, description, status, created_at FROM tickets WHERE created_by = $1 ORDER BY t.created_at DESC`, [userId]);
      }
      return res.json(result.rows);
    } catch (error) { return res.status(500).json({ error: 'Erro interno no servidor.' }); }
  },

  async update(req: Request, res: Response) {
    try {
      const result = updateTicketSchema.safeParse(req.body);

      if (!result.success) {
        const errorMessages = result.error.issues.map(err => err.message);
        return res.status(400).json({ error: errorMessages.join(', ') });
      }

      const authReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const { status, assigned_to } = result.data;
      const userRole = authReq.user?.role;

      if (userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem atualizar chamados.' });
      }

      const updatedTicket = await pool.query(
        `UPDATE tickets
         SET status = COALESCE($1, status),
             assigned_to = COALESCE($2, assigned_to),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING id, title, description, status, assigned_to, updated_at`,
        [status || null, assigned_to || null, id]
      );

      if (updatedTicket.rows.length === 0) {
        return res.status(404).json({ error: 'Chamado não encontrado.' });
      }

      return res.json(updatedTicket.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar ticket:', error);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }
};