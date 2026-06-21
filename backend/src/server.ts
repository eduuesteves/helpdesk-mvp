import express, { Request, Response } from "express";
import cors from "cors";
import { pool } from "./config/database";

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

// Rota para garantir que a API está ativa
app.get("/api/health", async (req: Request, res: Response) => {
    try {
        // Select para testar se o banco responde
        const dbRes = await pool.query("SELECT NOW() AS current_time");
        res.json({
            status: "ok",
            message: "Helpdesk API is running!",
            database_time: dbRes.rows[0].current_time
        });
    }catch (error) {
        res.status(500).json({ status: "error", message: "Database connection failed" });
    }
});

app.listen(PORT, () => {
    console.log("🚀 Server is running");
    // Fazemos uma query vazia só para disparar o evento "connect" e logar no terminal
    pool.query("SELECT 1").catch(console.error);
})