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
                `INSERT INTO tickets (title, description, created_by)
                VALUES ($1, $2, $3)
                RETURNING id, title, description, status, created_by, created_at`,
                [title, description, userId]
            );

            return res.status(201).json(newTicket.rows[0]);
        } catch(error) {
            console.error(error);
            return res.status(500).json({ error: "Erro interno no servidor" });
        }
    },

    async listAll(req: Request, res: Response) {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.id;
            const userRole = authReq.user?.role;

            let result;

            // Regra de Negócio: RBAC direto no BD
            if(userRole === "ADMIN") {
                // Admin vê todos os chamados da empresa
                // Usamos um JOIN para trazer o nome do funcionário  que abriu o chamado.
                result = await pool.query(
                    `SELECT t.id, t.title, t.description, t.status, t.created_at, u.name AS creator_name 
                    FROM tickets t
                    JOIN users u ON t.created_by = u.id
                    ORDER BY t.created_at DESC`
                );
            } else {
                // Funcionário comum (EMPLOYEE) só vê os chamados criados por ele
                result = await pool.query(
                    `SELECT id, title, description, status, created_at 
                    FROM tickets
                    WHERE created_by = $1
                    ORDER BY created_at DESC`,
                    [userId]
                );
            }

            return res.json(result.rows);
        } catch(error) {
            console.error("Erro ao listar tickets", error);
            return res.status(500).json({ error: "Erro interno no servidor" });
        }
    }
};