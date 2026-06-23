import { Router, Response } from 'express';
import { UserController } from './controllers/UserController';
import { AuthenticatedRequest, authMiddleware } from './middlewares/auth';
import { TicketController } from './controllers/TicketController';
import { CommentController } from './controllers/CommentController';

const routes = Router();

routes.post('/auth/register-business', UserController.registerBusiness);
// Rota protegida por token: Apenas o Admin logado pode aceder
routes.post('/users/employee', UserController.createEmployee);

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

// Rota de Tickets
routes.post("/tickets", authMiddleware, TicketController.create);
routes.get("/tickets", authMiddleware, TicketController.listAll);
routes.patch("/tickets/:id", authMiddleware, TicketController.update);

// Rotas de Comentários (Sub-Recursos)
routes.post("/tickets/:id/comments", authMiddleware, CommentController.create);
routes.get("/tickets/:id/comments", authMiddleware, CommentController.listByTicket);

export default routes;