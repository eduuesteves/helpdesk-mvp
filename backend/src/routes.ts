import { Router } from 'express';
import { UserController } from './controllers/UserController';

const routes = Router();

// Rota de criação de usuários
routes.post('/users', UserController.register);
routes.post("/login", UserController.login);

export default routes;