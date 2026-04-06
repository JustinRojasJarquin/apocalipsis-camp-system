import { useState } from "react";
import type { Exploracion, RolEnMision, PersonaMock } from "../types";
import { asignarPersona, quitarPersona } from "../exploraciones.api";

// TODO: Reemplazar con llamada real a GET /api/personas?campamento=:id
// cuando el módulo de Personas (Ashley) esté listo.
const PERSONAS_MOCK: PersonaMock[] = [
  { id_persona: 1, nombre: "Carlos", apellidos: "Ramírez" },
  { id_persona: 2, nombre: "Laura", apellidos: "Jiménez" },
  { id_persona: 3, nombre: "Marco", apellidos: "Solís" },
  { id_persona: 4, nombre: "Valeria", apellidos: "Mora" },
];

interface Props {
  exploracion: Exploracion;
  onCerrar: () => void;
}

function AsignarPersonas({ exploracion, onCerrar }: Props) {
  const [idPersonaSeleccionada, setIdPersonaSeleccionada] = useState<number>(0);
  const [rol, setRol] = useState<RolEnMision>("EXPLORADOR");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const idsAsignados = exploracion.exploracion_persona.map((p) => p.id_persona);

  const personasDisponibles = PERSONAS_MOCK.filter(
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
    } catch (e: any) {
      setError(e.message);
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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  const nombrePersona = (id: number) => {
    const p = PERSONAS_MOCK.find((x) => x.id_persona === id);
    return p ? `${p.nombre} ${p.apellidos}` : `Persona #${id}`;
  };

  return (
    <div className="form-container">
      <h2>Personas en la misión</h2>
      <p className="subtitulo">{exploracion.nombre}</p>

      {/* Lista actual */}
      <div className="lista-asignados">
        <h3>Asignados ({exploracion.exploracion_persona.length})</h3>
        {exploracion.exploracion_persona.length === 0 ? (
          <p className="sin-datos-inline">Sin personas asignadas aún.</p>
        ) : (
          <ul>
            {exploracion.exploracion_persona.map((ep) => (
              <li key={ep.id_persona} className="asignado-item">
                <span>{nombrePersona(ep.id_persona)}</span>
                <span className="rol-badge">{ep.rol_en_mision}</span>
                {exploracion.estado === "PLANIFICADA" && (
                  <button
                    className="btn-quitar"
                    onClick={() => handleQuitar(ep.id_persona)}
                    disabled={cargando}
                  >
                    Quitar
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Agregar persona — solo si está planificada */}
      {exploracion.estado === "PLANIFICADA" && (
        <div className="agregar-seccion">
          <h3>Agregar explorador</h3>

          {personasDisponibles.length === 0 ? (
            <p className="sin-datos-inline">
              No hay más personas disponibles.
              {/* TODO: Este listado vendrá de GET /api/personas cuando Ashley termine su módulo */}
            </p>
          ) : (
            <>
              <div className="campos-fila">
                <div className="campo">
                  <label htmlFor="persona">Persona</label>
                  <select
                    id="persona"
                    value={idPersonaSeleccionada}
                    onChange={(e) =>
                      setIdPersonaSeleccionada(Number(e.target.value))
                    }
                  >
                    <option value={0}>-- Seleccionar --</option>
                    {personasDisponibles.map((p) => (
                      <option key={p.id_persona} value={p.id_persona}>
                        {p.nombre} {p.apellidos}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="campo">
                  <label htmlFor="rol">Rol en misión</label>
                  <select
                    id="rol"
                    value={rol}
                    onChange={(e) => setRol(e.target.value as RolEnMision)}
                  >
                    <option value="EXPLORADOR">Explorador</option>
                    <option value="LIDER">Líder</option>
                  </select>
                </div>
              </div>

              {error && <p className="error-text">{error}</p>}

              <button
                className="btn-primario"
                onClick={handleAsignar}
                disabled={cargando}
              >
                {cargando ? "Asignando..." : "Asignar"}
              </button>
            </>
          )}
        </div>
      )}

      <div className="form-acciones">
        <button className="btn-secundario" onClick={onCerrar}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default AsignarPersonas;
