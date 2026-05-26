import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import campamentosRoutes from "./modules/campamentos/campamentos.routes";
import personasRoutes from "./modules/personas/personas.routes";
import exploracionesRoutes from "./modules/exploraciones/exploraciones.routes";
import inventarioRoutes from "./modules/inventario/inventario.routes";
import recursosRoutes from "./modules/recursos/recursos.routes";
import solicitudesRoutes from "./modules/solicitudes/solicitudes.routes";
import cargosRoutes from "./modules/cargos/cargos.routes";
import estadosPersonaRoutes from "./modules/estados-persona/estados-persona.routes";
import { verificarToken } from "./middlewares/auth.middleware";
import usuariosRoutes from "./modules/usuarios/usuarios.routes";
import rolesRoutes from "./modules/roles/roles.routes";
import enviosRoutes from "./modules/envios/envios.routes";
import { seedRecursos } from "./modules/recursos/recursos.service";
import { errorMiddleware } from "./middlewares/error.middleware";

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
app.use("/api/recursos", recursosRoutes);
app.use("/api/exploraciones", exploracionesRoutes);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/envios", enviosRoutes);

seedRecursos().catch((error) => {
  console.warn("No se pudieron sembrar recursos de prueba:", error.message);
});

// Global error handler (logs error and returns JSON)
app.use(errorMiddleware);

export default app;
