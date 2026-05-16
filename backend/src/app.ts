import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import campamentosRoutes from "./modules/campamentos/campamentos.routes";
import personasRoutes from "./modules/personas/personas.routes";
import exploracionesRoutes from "./modules/exploraciones/exploraciones.routes";
import inventarioRoutes from "./modules/inventario/inventario.routes";
import solicitudesRoutes from "./modules/solicitudes/solicitudes.routes";
import cargosRoutes from "./modules/cargos/cargos.routes";
import estadosPersonaRoutes from "./modules/estados-persona/estados-persona.routes";
import { verificarToken } from "./middlewares/auth.middleware";
import usuariosRoutes from "./modules/usuarios/usuarios.routes";
import rolesRoutes from "./modules/roles/roles.routes";

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
app.use("/api/cargos", cargosRoutes);
app.use("/api/estados-persona", estadosPersonaRoutes);
app.use("/api/inventario", inventarioRoutes);
app.use("/api/exploraciones", exploracionesRoutes);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/roles", rolesRoutes);

export default app;
