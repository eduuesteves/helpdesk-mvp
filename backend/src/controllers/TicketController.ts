import { Request, Response } from "express";
import { pool } from "../config/database";
import { AuthenticatedRequest } from "../middlewares/auth";

export const TicketController = {
    async create(req: Request, res: Response) {
        try {
            // Fazemos o cast para ter aceso seguro ao req.user injetado pelo middleware
            const authReq = req as AuthenticatedRequest;
            const { title, description } = req.body;
            const userId = authReq.user?.id;

            // Validação rápida
            if(!title || !description) {
                return res.status(400).json({ error: "Título e descrição são obrigatórios" });
            }

            // Insere o ticket associando o criador automaticamente via JWT
            const newTicket = await pool.query(
                `INSERT INTO tiket (title, description, created_by)
                VALUES ($1, $2, $3)
                RETURNING id, title, description, status, created_by, created_at`,
                [title, description, userId]
            );

            return res.status(201).json(newTicket.rows[0]);
        } catch(error) {
            return res.status(500).json({ error: "Erro interno no servidor" });
        }
    }
};