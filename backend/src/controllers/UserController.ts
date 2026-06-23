import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { registerSchema, loginSchema, registerBusinessSchema } from '../schemas/authSchema';
import { AuthenticatedRequest } from '../middlewares/auth';

export const UserController = {
  async register(req: Request, res: Response) {
    try {
      // O método safeParse valida os dados sem estourar um erro no Node.js
      const result = registerSchema.safeParse(req.body);

      if (!result.success) {
        // Trocado .errors por .issues, que é a propriedade oficial e tipada do ZodError
        const errorMessages = result.error.issues.map(err => err.message);
        return res.status(400).json({ error: errorMessages.join(', ') });
}

      // Agora usamos os dados validados e tipados pelo Zod com total segurança
      const { name, email, password, role } = result.data;

      const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ error: 'Este email já está em uso.' });
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      const userRole = role === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE';

      const newUser = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, created_at`,
        [name, email, passwordHash, userRole]
      );

      return res.status(201).json(newUser.rows[0]);
    } catch (error) {
      console.error('Erro no cadastro de usuário:', error);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  },

  async login(req: Request, res: Response) {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      const errorMessages = result.error.issues.map(err => err.message);
      return res.status(400).json({ error: errorMessages.join(', ') });
    }

    const { email, password } = result.data;

    // Alterado: Adicionado company_id no SELECT
    const userResult = await pool.query(
      'SELECT id, name, email, password_hash, role, company_id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Alterado: company_id agora faz parte do payload encriptado do JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, company_id: user.company_id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    return res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
  },
  async registerBusiness(req: Request, res: Response) {
    // Pegamos um cliente dedicado do pool para gerenciar a transação de forma isolada
    const client = await pool.connect();
    
    try {
      const result = registerBusinessSchema.safeParse(req.body);
      if (!result.success) {
        const errorMessages = result.error.issues.map(err => err.message);
        return res.status(400).json({ error: errorMessages.join(', ') });
      }

      const { companyName, name, email, password } = result.data;

      // Verifica se o email já está em uso no sistema inteiro
      const userExists = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ error: 'Este e-mail já está em uso.' });
      }

      // INÍCIO DA TRANSAÇÃO: Daqui para frente, tudo ou nada!
      await client.query('BEGIN');

      // Passo A: Criar a nova empresa cliente
      const companyResult = await client.query(
        'INSERT INTO companies (name) VALUES ($1) RETURNING id, name',
        [companyName]
      );
      const newCompany = companyResult.rows[0];

      // Passo B: Criptografar a senha do admin dessa empresa
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Passo C: Criar o usuário atrelando-o obrigatoriamente à nova empresa como ADMIN
      const userResult = await client.query(
        `INSERT INTO users (name, email, password_hash, role, company_id)
         VALUES ($1, $2, $3, 'ADMIN', $4)
         RETURNING id, name, email, role, created_at`,
        [name, email, passwordHash, newCompany.id]
      );

      // Salva tudo permanentemente no disco do PostgreSQL
      await client.query('COMMIT');

      return res.status(201).json({
        message: 'Empresa e Administrador provisionados com sucesso!',
        company: newCompany,
        admin: userResult.rows[0]
      });

    } catch (error) {
      // Se qualquer um dos passos falhar, desfaz as alterações na hora para não sujar o banco
      await client.query('ROLLBACK');
      console.error('Erro no provisionamento de tenant:', error);
      return res.status(500).json({ error: 'Erro interno ao registrar empresa.' });
    } finally {
      // Libera o cliente de volta para o pool de conexões (Obrigatório de mercado!)
      client.release();
    }
  },
  async createEmployee(req: Request, res: Response) {
  try {
    // Usamos o schema de registo normal para validar os dados do funcionário
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      const errorMessages = result.error.issues.map(err => err.message);
      return res.status(400).json({ error: errorMessages.join(', ') });
    }

    const authReq = req as AuthenticatedRequest;
    console.log("DADOS DO USUÁRIO LOGADO NO BACKEND:", authReq.user);
    const adminRole = authReq.user?.role;
    const companyId = authReq.user?.company_id; // <-- Puxa a empresa do Admin logado

    // Defesa de Segurança (RBAC): Apenas ADMINs da empresa podem criar utilizadores aqui
    if (adminRole !== 'ADMIN') {
      return res.status(403).json({ 
        error: `Acesso negado. Sua role atual é: ${adminRole}` 
      });
    }

    const { name, email, password } = result.data;

    // Verifica se o e-mail já existe no sistema global
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Este e-mail já está registado.' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Inserção forçando o nível 'EMPLOYEE' e o 'company_id' do administrador
    const newEmployee = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, company_id)
       VALUES ($1, $2, $3, 'EMPLOYEE', $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash, companyId]
    );

    return res.status(201).json(newEmployee.rows[0]);
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    return res.status(500).json({ error: 'Erro interno ao criar utilizador.' });
  }
  }
};