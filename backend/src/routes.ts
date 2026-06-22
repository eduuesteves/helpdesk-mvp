import { Router, Response } from 'express';
import { UserController } from './controllers/UserController';
import { AuthenticatedRequest, authMiddleware } from './middlewares/auth';
import { TicketController } from './controllers/TicketController';

const routes = Router();


// Rota PÚBLICAS (Qualquer um acessa)
routes.post('/users', UserController.register);
routes.post("/login", UserController.login);

// Rotas PROTEGIDAS (Exigem o crachá/token)
// Repare que passamos o authMiddleware antes da função final
routes.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  // Se chegou aqui, o middleware deixou passar e injetou o req.user
  res.json({
    message: 'Você acessou uma rota protegida!',
    user: req.user
  });
});

// Rota Core do Negócio
routes.post("/tickets", authMiddleware, TicketController.create);

export default routes;