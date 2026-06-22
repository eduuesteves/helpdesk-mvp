import { Pool } from 'pg';
import 'dotenv/config';

// Checa se estamos rodando em produção
const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Exigência do mercado: Bancos na nuvem exigem SSL ativo, mas localmente não.
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('📦 Conexão com o PostgreSQL estabelecida com sucesso!');
});

pool.on('error', (err: Error) => {
  console.error('❌ Erro inesperado no cliente do banco de dados', err);
  process.exit(-1);
});