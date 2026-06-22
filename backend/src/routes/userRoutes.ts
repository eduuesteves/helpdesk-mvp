import { Router } from "express";
import { createUser } from "../controllers/userController";

const router = Router();

// Rota POST para criar um usuário
router.post("/", createUser);

export default router;

