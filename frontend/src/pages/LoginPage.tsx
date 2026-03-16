import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../services/auth.service";

import userIcon from "../assets/user.png";
import lockIcon from "../assets/lock.png";
import eyeOpenIcon from "../assets/eye-open.png";
import eyeClosedIcon from "../assets/eye-closed.png";

function LoginPage() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [recordarme, setRecordarme] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

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

      if (recordarme) {
        localStorage.setItem("recordarme", "true");
      } else {
        localStorage.removeItem("recordarme");
      }

      navigate("/dashboard");
    } catch (error: any) {
      setMensajeError(error.message || "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-icon">
          <img src={userIcon} alt="Usuario" className="login-main-icon" />
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-line">
            <span className="input-icon">
              <img src={userIcon} alt="Usuario" className="input-icon-img" />
            </span>

            <input
              type="text"
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="input-line">
            <span className="input-icon">
              <img src={lockIcon} alt="Contraseña" className="input-icon-img" />
            </span>

            <input
              type={mostrarPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <img
                src={mostrarPassword ? eyeOpenIcon : eyeClosedIcon}
                alt={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="eye-icon-img"
              />
            </button>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={recordarme}
                onChange={(e) => setRecordarme(e.target.checked)}
              />
              <span>Recordarme</span>
            </label>

            <a href="#" className="forgot-password">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {mensajeError && <span className="error-text">{mensajeError}</span>}

          <button type="submit" disabled={cargando} className="login-button">
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;