import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
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
// Rutas del módulo de autenticación
app.use("/api/auth", authRoutes);

export default app;