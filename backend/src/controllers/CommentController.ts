import { Request, Response } from "express";
import { pool } from "../config/database";
import { AuthenticatedRequest } from "../middlewares/auth";

export const CommentController = {
    // Cria um comentário dentro de um chamado
    async create(req: Request, res: Response) {
        try {
            const authReq = req as AuthenticatedRequest;
            const { id: ticketId } = req.params;
            const { content } = req.body;
            const userId = authReq.user?.id;

            if(!content || content.trim() === "") {
                return res.status(400).json({ error: "O conteúdo do comentário não pode estar vazio" });
            }

            // Verifica se o ticket realmente existe antes de comentar
            const ticketExists = await pool.query("SELECT id FROM tickets WHERE id = $1", [ticketId]);
            if(ticketExists.rows.length === 0) {
                return res.status(404).json({ error: "Chamado não encontrado" });
            }

            // Insere o comentário
            const newComment = await pool.query(
                `INSERT INTO comments (ticket_id, user_id, content) 
                VALUES ($1, $2, $3) 
                RETURNING id, ticket_id, user_id, content, created_at`,
                [ticketId, userId, content]
            );

            return res.status(201).json(newComment.rows[0]);
        } catch(error) {
            console.error("Erro ao criar comentário: ", error);
            return res.status(500).json({ error: "Erro interno no servidor" });
        }
    },

    // Lista a timeline de comentários de um chamado
    async listByTicket(req: Request, res: Response) {
        try {
            const { id: ticketId } = req.params;

            // Busca os comentários ordenados do mais antigo para o mais recente
            const comments = await pool.query(
                `SELECT c.id, c.content, c.created_at, u.name AS user_role
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.ticket_id = $1
                ORDER BY c.created_at ASC`,
                [ticketId]
            );

            return res.json(comments.rows);
        } catch(error) {
            console.error("Erro ao listar comentários: ", error);
            return res.status(500).json({ error: "Erro interno no servidor" });
        }
    }
}