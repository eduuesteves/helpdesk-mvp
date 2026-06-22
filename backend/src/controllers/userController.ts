import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/database';
import jwt from 'jsonwebtoken';

export const UserController = {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

      // Validação básica 80/20
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
      }

      // Verifica se o email já existe no banco
      const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ error: 'Este email já está em uso.' });
      }

      // Criptografa a senha (Hash)
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Garante que o role seja apenas ADMIN ou EMPLOYEE (evita injeção de dados inválidos)
      const userRole = role === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE';

      // Insere no banco e retorna os dados do usuário (SEM a senha)
      const newUser = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, created_at`,
        [name, email, passwordHash, userRole]
      );

      res.status(201).json(newUser.rows[0]);
    } catch (error) {
      console.error('Erro no cadastro de usuário:', error);
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  },
  async login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).json({ error: "Email e senha são obrigatórios" })
        }

        // Busca o usuário pelo email
        const userResult = await pool.query("SELECT id, name, email, password_hash, role FROM users WHERE email = $1", [email]);

        if(userResult.rows.length === 0) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        };

        const user = userResult.rows[0];

        // Compara a senha enviada com o hash salvo no banco
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if(!isPasswordValid) {
            return res.status(401).json({ error: "Credenciais Inválidas" });
        }

        // Gera o JWT (válido por 1 dias) contendo o ID e o Role do usuário
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: "1d"}
        );

        // Retorna o token e os dados do usuário (sempre removendo a senha da resposta)
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });  
    } catch(error) {
        console.error("Erro no login: ", error);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }
};