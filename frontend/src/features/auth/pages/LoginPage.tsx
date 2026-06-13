import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Eye, EyeOff, Lock, Skull, User } from "lucide-react";

import { loginRequest } from "../auth.api";
import { storage } from "../../../shared/utils/storage";
import "../../../styles/login.css";

function LoginPage() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);

  const [recordarme, setRecordarme] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [scanning, setScanning] = useState(true);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const scanTimer = setTimeout(() => {
      setScanning(false);
    }, 1200);

    const glitchInterval = setInterval(() => {
      setGlitch(true);

      setTimeout(() => {
        setGlitch(false);
      }, 120);
    }, 9000);

    return () => {
      clearTimeout(scanTimer);
      clearInterval(glitchInterval);
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMensajeError("");

    if (!usuario.trim() || !password.trim()) {
      setMensajeError("Debe ingresar usuario y contrasena.");
      return;
    }

    try {
      setCargando(true);

      const respuesta = await loginRequest({
        usuario: usuario.trim(),
        password,
      });

      storage.setToken(respuesta.token);
      storage.setUsuario(respuesta.usuario);

      if (recordarme) {
        localStorage.setItem("recordarme", "true");
      } else {
        localStorage.removeItem("recordarme");
      }

      navigate("/dashboard");
    } catch (error: any) {
      setMensajeError(error.message || "Error al iniciar sesion");
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      {/* FULL-SCREEN SPLASH */}
      {scanning && (
        <div className="login-splash-overlay">
          <div className="login-splash-content">
            <div className="login-splash-icon">
              <Skull size={64} />
            </div>
            <p className="login-splash-text">Inicializando sistema...</p>
            <div className="login-splash-track">
              <div className="login-splash-bar" />
            </div>
          </div>
        </div>
      )}

      <div className="login-page-container">
      <div className="login-animated-bg" />
      <div className="login-energy-line login-energy-line-1" />
      <div className="login-energy-line login-energy-line-2" />
      <div className="login-energy-line login-energy-line-3" />
      <div className="login-particle" style={{ left: "10%", top: "20%", animationDelay: "0s" }} />
      <div className="login-particle" style={{ left: "80%", top: "30%", animationDelay: "1s" }} />
      <div className="login-particle" style={{ left: "50%", top: "60%", animationDelay: "2s" }} />
      <div className="login-particle" style={{ left: "20%", top: "80%", animationDelay: "3s" }} />
      <div className="login-particle" style={{ left: "90%", top: "70%", animationDelay: "1.5s" }} />

      <div className="login-grid-overlay" aria-hidden="true" />

      <div
        className={`login-shell ${glitch ? "animate-glitch" : ""}`}
      >
        <section className="login-card-panel">
          <div className="login-card-header">
            <span>Acceso seguro</span>
            <h2>Iniciar sesion</h2>
            <p>Ingresa tus credenciales para continuar.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-form-container">
              <div className="login-form-header" />

              <div className="login-input-group">
                <label className="login-input-label">
                  <User className="h-4 w-4" />
                  Usuario
                </label>

                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="usuario@gmail.com"
                  className="login-input-field"
                />
              </div>

              <div className="login-input-group">
                <label className="login-input-label">
                  <Lock className="h-4 w-4" />
                  Contrasena
                </label>

                <div className="login-password-wrapper">
                  <input
                    type={mostrarPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="**********"
                    className="login-input-field"
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="login-toggle-password"
                  >
                    {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="login-checkbox-group">
                <input
                  type="checkbox"
                  checked={recordarme}
                  onChange={(e) => setRecordarme(e.target.checked)}
                />

                <span>Recordarme</span>
              </div>

              {mensajeError && (
                <div className="login-error-box">
                  {mensajeError}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="login-button"
              >
                {cargando ? "Autenticando..." : "Autorizar acceso"}
              </button>

              <div className="login-footer-text">
                <p>Todo acceso es monitoreado y registrado</p>
              </div>
            </div>
          </form>
        </section>

        <section className="login-brand-panel">
          <div className="login-brand-badge">
            <Skull className="h-5 w-5" />
            Sistema activo
          </div>

          <div className="login-brand-content">
            <p className="login-overline">Apocalipsis Camp System</p>
            <h1>Control operativo de supervivencia</h1>
            <p className="login-brand-description">
              Plataforma centralizada para administrar campamentos, personas,
              inventario, exploraciones y evaluaciones de ingreso en entornos
              criticos.
            </p>

            <ul className="login-feature-list">
              <li>Gestion de campamentos, solicitudes y envios</li>
              <li>Personas, cargos, estados y evaluaciones con IA</li>
              <li>Inventario, catalogo de recursos y operaciones diarias</li>
              <li>Exploraciones y seguimiento de misiones</li>
            </ul>
          </div>

          <div className="login-status-section">
            <div className="status-item">
              <span className="status-label">
                <span className="status-indicator" />
                Sistema
              </span>
              <span className="status-value status-online">En linea</span>
            </div>

            <div className="status-item">
              <span className="status-label">
                <AlertTriangle className="h-3.5 w-3.5" />
                Nivel de acceso
              </span>
              <span className="status-value status-high">Restringido</span>
            </div>

            <div className="status-item">
              <span className="status-label">Auditoria</span>
              <span className="status-value status-critical">Activa</span>
            </div>
          </div>
        </section>
      </div>
    </div>
    </>
  );
}

export default LoginPage;
