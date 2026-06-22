import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthenticatedRequest } from '../middlewares/auth';
import { createCommentSchema } from '../schemas/commentSchema'; // <-- Import

export const CommentController = {
  async create(req: Request, res: Response) {
    try {
      const result = createCommentSchema.safeParse(req.body);

      if (!result.success) {
        const errorMessages = result.error.issues.map(err => err.message);
        return res.status(400).json({ error: errorMessages.join(', ') });
      }

      const authReq = req as AuthenticatedRequest;
      const { id: ticketId } = req.params;
      const { content } = result.data;
      const userId = authReq.user?.id;

      const ticketExists = await pool.query('SELECT id FROM tickets WHERE id = $1', [ticketId]);
      if (ticketExists.rows.length === 0) {
        return res.status(404).json({ error: 'Chamado não encontrado.' });
      }

      const newComment = await pool.query(
        `INSERT INTO comments (ticket_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING id, ticket_id, user_id, content, created_at`,
        [ticketId, userId, content]
      );

      return res.status(201).json(newComment.rows[0]);
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  },

  async listByTicket(req: Request, res: Response) {
    // ... mantenha o método listByTicket exatamente como estava antes ...
    try {
      const { id: ticketId } = req.params;
      const comments = await pool.query(`SELECT c.id, c.content, c.created_at, u.name AS user_name, u.role AS user_role FROM comments c JOIN users u ON c.user_id = u.id WHERE c.ticket_id = $1 ORDER BY c.created_at ASC`, [ticketId]);
      return res.json(comments.rows);
    } catch (error) { return res.status(500).json({ error: 'Erro interno no servidor.' }); }
  }
};