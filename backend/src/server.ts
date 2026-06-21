import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

// Rota para garantir que a API está ativa
app.get("/apit/health", (req: Request, res: Response) => {
    res.json({ status: "ok", message: "Helpdesk API is running!" });
});

app.listen(PORT, () => {
    console.log("🚀 Server is running");
})