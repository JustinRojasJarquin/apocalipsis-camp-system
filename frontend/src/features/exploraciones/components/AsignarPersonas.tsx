import { useState, useEffect } from "react";
import type { Exploracion, RolEnMision, PersonaResumen } from "../types";
import { asignarPersona, quitarPersona } from "../exploraciones.api";
import { getPersonas } from "../../personas/personas.api";
import { UserPlus, UserMinus, Shield, Users } from "lucide-react";

interface Props {
  exploracion: Exploracion;
  onCerrar: () => void;
}

const ROL_LABELS: Record<RolEnMision, string> = {
  EXPLORADOR: "Explorador",
  LIDER: "Líder",
};

const ROL_COLORS: Record<RolEnMision, string> = {
  EXPLORADOR: "#38bdf8",
  LIDER: "#f59e0b",
};

function AsignarPersonas({ exploracion, onCerrar }: Props) {
  const [personas, setPersonas] = useState<PersonaResumen[]>([]);
  const [idPersonaSeleccionada, setIdPersonaSeleccionada] = useState<number>(0);
  const [rol, setRol] = useState<RolEnMision>("EXPLORADOR");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    getPersonas()
      .then((data) =>
        setPersonas(
          data
            .filter((p) => p.activo !== false && p.id_persona !== undefined)
            .map((p) => ({
              id_persona: p.id_persona as number,
              nombre: p.nombre,
              apellidos: p.apellidos,
            }))
        )
      )
      .catch(() => setError("No se pudieron cargar las personas"));
  }, []);

  const idsAsignados = exploracion.exploracion_persona.map((p) => p.id_persona);
  const personasDisponibles = personas.filter(
    (p) => !idsAsignados.includes(p.id_persona)
  );

  const handleAsignar = async () => {
    if (!idPersonaSeleccionada) {
      setError("Selecciona una persona");
      return;
    }
    setError("");
    setCargando(true);
    try {
      await asignarPersona(exploracion.id_exploracion, {
        id_persona: idPersonaSeleccionada,
        rol_en_mision: rol,
      });
      setIdPersonaSeleccionada(0);
      onCerrar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al asignar persona");
    } finally {
      setCargando(false);
    }
  };

  const handleQuitar = async (id_persona: number) => {
    setCargando(true);
    setError("");
    try {
      await quitarPersona(exploracion.id_exploracion, id_persona);
      onCerrar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al quitar persona");
    } finally {
      setCargando(false);
    }
  };

  const nombrePersona = (id: number) => {
    const p = personas.find((x) => x.id_persona === id);
    return p ? `${p.nombre} ${p.apellidos}` : `Persona #${id}`;
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
              <Users size={18} /> Personas en la misión
            </h3>
            <p className="section-header__sub" style={{ margin: "4px 0 0" }}>
              {exploracion.nombre}
            </p>
          </div>
        </div>

        {/* Team list */}
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "var(--section-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Equipo asignado ({exploracion.exploracion_persona.length})
          </h4>

          {exploracion.exploracion_persona.length === 0 ? (
            <div
              className="section-empty"
              style={{ padding: "24px 16px", borderRadius: 8, background: "rgba(0,0,0,0.1)" }}
            >
              <p className="section-empty__desc" style={{ margin: 0 }}>
                Sin personas asignadas aún.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {exploracion.exploracion_persona.map((ep) => (
                <div
                  key={ep.id_persona}
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
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "rgba(56,189,248,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#38bdf8",
                      }}
                    >
                      {nombrePersona(ep.id_persona).charAt(0)}
                    </div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>
                        {nombrePersona(ep.id_persona)}
                      </span>
                      <div style={{ fontSize: 12, color: "var(--section-muted)", marginTop: 2 }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                            color: ROL_COLORS[ep.rol_en_mision],
                          }}
                        >
                          <Shield size={11} />
                          {ROL_LABELS[ep.rol_en_mision]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {exploracion.estado === "PLANIFICADA" && (
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      style={{ color: "#ef4444" }}
                      onClick={() => handleQuitar(ep.id_persona)}
                      disabled={cargando}
                    >
                      <UserMinus size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add new explorer */}
        {exploracion.estado === "PLANIFICADA" && (
          <div
            style={{
              padding: 20,
              borderRadius: 8,
              border: "1px solid var(--section-border)",
              background: "rgba(56,189,248,0.03)",
            }}
          >
            <h4
              style={{
                margin: "0 0 16px",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#38bdf8",
              }}
            >
              <UserPlus size={15} /> Agregar explorador
            </h4>

            {personasDisponibles.length === 0 ? (
              <p className="section-empty__desc" style={{ margin: 0, textAlign: "center", padding: "16px 0" }}>
                No hay más personas disponibles.
              </p>
            ) : (
              <>
                <div className="modal-form__row" style={{ marginBottom: 16 }}>
                  <label className="form-field">
                    <span>Persona</span>
                    <select
                      value={idPersonaSeleccionada}
                      onChange={(e) => setIdPersonaSeleccionada(Number(e.target.value))}
                    >
                      <option value={0}>-- Seleccionar --</option>
                      {personasDisponibles.map((p) => (
                        <option key={p.id_persona} value={p.id_persona}>
                          {p.nombre} {p.apellidos}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="form-field">
                    <span>Rol en misión</span>
                    <select
                      value={rol}
                      onChange={(e) => setRol(e.target.value as RolEnMision)}
                    >
                      <option value="EXPLORADOR">Explorador</option>
                      <option value="LIDER">Líder</option>
                    </select>
                  </label>
                </div>

                {error && <div className="error-box">{error}</div>}

                <div className="modal-form__actions" style={{ justifyContent: "flex-start" }}>
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={handleAsignar}
                    disabled={cargando}
                  >
                    {cargando ? "Asignando..." : "Asignar a la misión"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {error && exploracion.estado !== "PLANIFICADA" && (
          <div className="error-box" style={{ marginTop: 16 }}>{error}</div>
        )}

        <div className="modal-form__actions" style={{ marginTop: 24 }}>
          <button type="button" className="button button-secondary" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AsignarPersonas;