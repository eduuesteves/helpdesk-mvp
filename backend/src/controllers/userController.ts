import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { pool } from "../config/database";

export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role } = req.body;

    try {
        // Validação básica
        if(!name || !email || !password) {
            res.status(400).json({ error: "Nome, email e senha são obrigatórios"});
            return;
        }  

        // Criptografar a senha (hash)
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Inserir no banco de dados (o RETURNING devolve os dados sem a senha)
        const result = await pool.query(
            `INSERT INTO users(name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role, created_at`,
            [name, email, passwordHash, role || "EMPLOYEE"]
        );

        // Retornar sucesso
        res.status(201).json({
            message: "Usuário criado com sucesso",
            user: result.rows[0]
        });
    } catch(error: any) {
        console.error("Erro ao criar usuário: ", error);

        // Tratamento específico para e-mail duplicado no Postgres (código 23505)
        if (error.code === "23505") {
            res.status(409).json({ error: "Este e-mail já está em uso" });
            return;
        }

        res.status(500).json({ error: "Erro interno no servidor" });
    }
}