import { Pool } from "pg";
import "dotenv/config";

// Instancia o Pool usando a URL de conexão do .env
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.on("connect", () => {
    console.log("📦 Conexão com o PostgreSQL estabelecida com sucesso!");
})

pool.on("error", (err) => {
    console.error("❌ Erro inesperado no cliente do banco de dados", err);
    process.exit(-1);
})