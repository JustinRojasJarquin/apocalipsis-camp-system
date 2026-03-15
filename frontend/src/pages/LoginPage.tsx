import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../services/auth.service";

function LoginPage() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensajeError("");

    if (!usuario.trim() || !password.trim()) {
      setMensajeError("Debes completar usuario y contraseña");
      return;
    }

    try {
      setCargando(true);

      const respuesta = await loginRequest({
        usuario,
        password,
      });

      localStorage.setItem("token", respuesta.token);
      localStorage.setItem("usuario", JSON.stringify(respuesta.usuario));

      navigate("/dashboard");
    } catch (error: any) {
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Sistema</h1>
        <p>Inicia sesion</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {mensajeError && <span className="error-text">{mensajeError}</span>}

          <button type="submit" disabled={cargando}>
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;