import { useState, useEffect } from "react";
import type { Exploracion } from "../types";
import {
  agregarRecursoLlevado,
  registrarRecursoEncontrado,
} from "../exploraciones.api";
import { getAvailableResources } from "../../inventario/inventario.api";
import type { RecursoOption } from "../../inventario/types";
import { Package, Search, Plus, Backpack, Sparkles } from "lucide-react";

interface Props {
  exploracion: Exploracion;
  onCerrar: () => void;
}

function RecursosMision({ exploracion, onCerrar }: Props) {
  const [recursos, setRecursos] = useState<RecursoOption[]>([]);
  const esPlanificada = exploracion.estado === "PLANIFICADA";
  const esEnProgreso =
    exploracion.estado === "EN_PROGRESO" || exploracion.estado === "COMPLETADA";

  const [idRecursoLlevado, setIdRecursoLlevado] = useState<number>(0);
  const [cantidadLlevada, setCantidadLlevada] = useState<number>(1);
  const [idRecursoEncontrado, setIdRecursoEncontrado] = useState<number>(0);
  const [cantidadEncontrada, setCantidadEncontrada] = useState<number>(0);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    getAvailableResources()
      .then(setRecursos)
      .catch(() => setError("No se pudieron cargar los recursos"));
  }, []);

  const nombreRecurso = (id: number) =>
    recursos.find((r) => r.id_recurso === id)?.nombre ?? `Recurso #${id}`;

  const handleAgregarLlevado = async () => {
    if (!idRecursoLlevado) {
      setError("Selecciona un recurso");
      return;
    }
    if (cantidadLlevada <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }
    setError("");
    setCargando(true);
    try {
      await agregarRecursoLlevado(exploracion.id_exploracion, {
        id_recurso: idRecursoLlevado,
        cantidad_llevada: cantidadLlevada,
      });
      setIdRecursoLlevado(0);
      setCantidadLlevada(1);
      onCerrar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al agregar recurso");
    } finally {
      setCargando(false);
    }
  };

  const handleRegistrarEncontrado = async () => {
    if (!idRecursoEncontrado) {
      setError("Selecciona un recurso encontrado");
      return;
    }
    if (cantidadEncontrada < 0) {
      setError("La cantidad no puede ser negativa");
      return;
    }
    setError("");
    setCargando(true);
    try {
      await registrarRecursoEncontrado(exploracion.id_exploracion, {
        id_recurso: idRecursoEncontrado,
        cantidad_encontrada: cantidadEncontrada,
      });
      setIdRecursoEncontrado(0);
      setCantidadEncontrada(0);
      onCerrar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al registrar recurso");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-form" style={{ maxWidth: "100%" }}>
      <div className="section-card" style={{ border: "none" }}>
        {/* Header */}
        <div
          className="section-header"
          style={{ marginBottom: 20, borderBottom: "1px solid var(--section-border)", paddingBottom: 16 }}
        >
          <div className="section-header__left">
            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <Package size={18} /> Recursos de la misión
            </h3>
            <p className="section-header__sub" style={{ margin: "4px 0 0" }}>
              {exploracion.nombre}
            </p>
          </div>
        </div>

        {/* ─── Recursos a llevar ─── */}
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "var(--section-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
            <Backpack size={14} /> Recursos a llevar ({exploracion.exploracion_recurso_llevado.length})
          </h4>

          {exploracion.exploracion_recurso_llevado.length === 0 ? (
            <div
              className="section-empty"
              style={{ padding: "24px 16px", borderRadius: 8, background: "rgba(0,0,0,0.1)" }}
            >
              <p className="section-empty__desc" style={{ margin: 0 }}>
                Sin recursos asignados.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {exploracion.exploracion_recurso_llevado.map((r) => (
                <div
                  key={r.id_registro}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--section-border)",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500 }}>
                    {nombreRecurso(r.id_recurso)}
                  </span>
                  <span
                    style={{
                      background: "rgba(246,196,83,0.15)",
                      color: "#f6c453",
                      padding: "2px 10px",
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    x{Number(r.cantidad_llevada).toLocaleString("es-CR")}
                  </span>
                </div>
              ))}
            </div>
          )}

          {esPlanificada && (
            <div
              style={{
                marginTop: 16,
                padding: 20,
                borderRadius: 8,
                border: "1px solid var(--section-border)",
                background: "rgba(246,196,83,0.03)",
              }}
            >
              <h4
                style={{
                  margin: "0 0 16px",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#f6c453",
                }}
              >
                <Plus size={15} /> Agregar recurso a llevar
              </h4>

              <div className="modal-form__row" style={{ marginBottom: 16 }}>
                <label className="form-field">
                  <span>Recurso</span>
                  <select
                    value={idRecursoLlevado}
                    onChange={(e) => setIdRecursoLlevado(Number(e.target.value))}
                  >
                    <option value={0}>-- Seleccionar --</option>
                    {recursos.map((r) => (
                      <option key={r.id_recurso} value={r.id_recurso}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Cantidad</span>
                  <input
                    type="number"
                    value={cantidadLlevada}
                    min={1}
                    onChange={(e) => setCantidadLlevada(Number(e.target.value))}
                  />
                </label>
              </div>

              <div className="modal-form__actions" style={{ justifyContent: "flex-start" }}>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handleAgregarLlevado}
                  disabled={cargando}
                >
                  {cargando ? "Guardando..." : "Agregar recurso"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Recursos encontrados ─── */}
        {esEnProgreso && (
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "var(--section-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
              <Search size={14} /> Recursos encontrados ({exploracion.exploracion_recurso_encontrado.length})
            </h4>

            {exploracion.exploracion_recurso_encontrado.length === 0 ? (
              <div
                className="section-empty"
                style={{ padding: "24px 16px", borderRadius: 8, background: "rgba(0,0,0,0.1)" }}
              >
                <p className="section-empty__desc" style={{ margin: 0 }}>
                  Sin recursos registrados aún.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {exploracion.exploracion_recurso_encontrado.map((r) => (
                  <div
                    key={r.id_registro}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--section-border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>
                        {nombreRecurso(r.id_recurso)}
                      </span>
                      {r.generado_aleatorio && (
                        <span
                          style={{
                            background: "rgba(167,139,250,0.15)",
                            color: "#a78bfa",
                            padding: "2px 8px",
                            borderRadius: 10,
                            fontSize: 11,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Sparkles size={10} /> Hallazgo
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        background: "rgba(52,211,153,0.15)",
                        color: "#34d399",
                        padding: "2px 10px",
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      x{Number(r.cantidad_encontrada).toLocaleString("es-CR")}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                marginTop: 16,
                padding: 20,
                borderRadius: 8,
                border: "1px solid var(--section-border)",
                background: "rgba(52,211,153,0.03)",
              }}
            >
              <h4
                style={{
                  margin: "0 0 16px",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#34d399",
                }}
              >
                <Plus size={15} /> Registrar recurso encontrado
              </h4>

              <div className="modal-form__row" style={{ marginBottom: 16 }}>
                <label className="form-field">
                  <span>Recurso encontrado</span>
                  <select
                    value={idRecursoEncontrado}
                    onChange={(e) =>
                      setIdRecursoEncontrado(Number(e.target.value))
                    }
                  >
                    <option value={0}>-- Seleccionar --</option>
                    {recursos.map((r) => (
                      <option key={r.id_recurso} value={r.id_recurso}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Cantidad</span>
                  <input
                    type="number"
                    value={cantidadEncontrada}
                    min={0}
                    onChange={(e) =>
                      setCantidadEncontrada(Number(e.target.value))
                    }
                  />
                </label>
              </div>

              <div className="modal-form__actions" style={{ justifyContent: "flex-start" }}>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handleRegistrarEncontrado}
                  disabled={cargando}
                >
                  {cargando ? "Guardando..." : "Registrar encontrado"}
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>
        )}

        <div className="modal-form__actions">
          <button type="button" className="button button-secondary" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecursosMision;