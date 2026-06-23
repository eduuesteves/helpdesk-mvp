import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { registerSchema, loginSchema } from '../schemas/authSchema';

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
}
};