import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import campamentosRoutes from "./modules/campamentos/campamentos.routes";
import personasRoutes from "./modules/personas/personas.routes";
import { verificarToken } from "./middlewares/auth.middleware";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.json({
    status: "Correcto",
    message: "Ejecutando en TypeScript",
  });
});

app.get("/api/privado", verificarToken, (req, res) => {
  res.json({
    mensaje: "Ruta protegida correcta",
    usuario: req.usuario,
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/campamentos", campamentosRoutes);
app.use("/api/personas", personasRoutes);

export default app;
