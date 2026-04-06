import { useState } from "react";
import type { Exploracion, RecursoMock } from "../types";
import {
  agregarRecursoLlevado,
  registrarRecursoEncontrado,
} from "../exploraciones.api";

// TODO: Reemplazar con llamada real a GET /api/inventario/recursos?campamento=:id
// cuando el módulo de Inventario (Cris) esté listo.
const RECURSOS_MOCK: RecursoMock[] = [
  { id_recurso: 1, nombre: "Agua", categoria: "AGUA", unidad: "litros" },
  { id_recurso: 2, nombre: "Raciones de comida", categoria: "COMIDA", unidad: "raciones" },
  { id_recurso: 3, nombre: "Munición", categoria: "MUNICION", unidad: "unidades" },
  { id_recurso: 4, nombre: "Medicamentos", categoria: "MEDICINA", unidad: "unidades" },
];

interface Props {
  exploracion: Exploracion;
  onCerrar: () => void;
}

function RecursosMision({ exploracion, onCerrar }: Props) {
  const esPlanificada = exploracion.estado === "PLANIFICADA";
  const esEnProgreso =
    exploracion.estado === "EN_PROGRESO" ||
    exploracion.estado === "COMPLETADA";

  // Formulario recursos a llevar
  const [idRecursoLlevado, setIdRecursoLlevado] = useState<number>(0);
  const [cantidadLlevada, setCantidadLlevada] = useState<number>(1);

  // Formulario recursos encontrados
  const [idRecursoEncontrado, setIdRecursoEncontrado] = useState<number>(0);
  const [cantidadEncontrada, setCantidadEncontrada] = useState<number>(0);

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const nombreRecurso = (id: number) =>
    RECURSOS_MOCK.find((r) => r.id_recurso === id)?.nombre ?? `Recurso #${id}`;

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
    } catch (e: any) {
      setError(e.message);
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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Recursos de la misión</h2>
      <p className="subtitulo">{exploracion.nombre}</p>

      {/* ─── Recursos a llevar ─── */}
      <div className="recursos-seccion">
        <h3>Recursos a llevar</h3>
        {exploracion.exploracion_recurso_llevado.length === 0 ? (
          <p className="sin-datos-inline">Sin recursos asignados.</p>
        ) : (
          <ul className="recursos-lista">
            {exploracion.exploracion_recurso_llevado.map((r) => (
              <li key={r.id_registro}>
                <span>{nombreRecurso(r.id_recurso)}</span>
                <span className="cantidad">
                  {Number(r.cantidad_llevada).toLocaleString("es-CR")}
                </span>
              </li>
            ))}
          </ul>
        )}

        {esPlanificada && (
          <div className="agregar-seccion">
            <div className="campos-fila">
              <div className="campo">
                <label htmlFor="recurso-llevar">Recurso</label>
                <select
                  id="recurso-llevar"
                  value={idRecursoLlevado}
                  onChange={(e) => setIdRecursoLlevado(Number(e.target.value))}
                >
                  <option value={0}>-- Seleccionar --</option>
                  {RECURSOS_MOCK.map((r) => (
                    <option key={r.id_recurso} value={r.id_recurso}>
                      {r.nombre} ({r.unidad})
                    </option>
                  ))}
                </select>
              </div>
              <div className="campo">
                <label htmlFor="cantidad-llevar">Cantidad</label>
                <input
                  id="cantidad-llevar"
                  type="number"
                  value={cantidadLlevada}
                  min={1}
                  onChange={(e) => setCantidadLlevada(Number(e.target.value))}
                />
              </div>
            </div>
            <button
              className="btn-primario"
              onClick={handleAgregarLlevado}
              disabled={cargando}
            >
              {cargando ? "Guardando..." : "Agregar recurso"}
            </button>
          </div>
        )}
      </div>

      {/* ─── Recursos encontrados ─── */}
      {esEnProgreso && (
        <div className="recursos-seccion">
          <h3>Recursos encontrados</h3>
          {exploracion.exploracion_recurso_encontrado.length === 0 ? (
            <p className="sin-datos-inline">Sin recursos registrados aún.</p>
          ) : (
            <ul className="recursos-lista">
              {exploracion.exploracion_recurso_encontrado.map((r) => (
                <li key={r.id_registro}>
                  <span>{nombreRecurso(r.id_recurso)}</span>
                  <span className="cantidad">
                    {Number(r.cantidad_encontrada).toLocaleString("es-CR")}
                  </span>
                  {r.generado_aleatorio && (
                    <span className="badge-aleatorio">Hallazgo</span>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="agregar-seccion">
            <div className="campos-fila">
              <div className="campo">
                <label htmlFor="recurso-encontrado">Recurso encontrado</label>
                <select
                  id="recurso-encontrado"
                  value={idRecursoEncontrado}
                  onChange={(e) =>
                    setIdRecursoEncontrado(Number(e.target.value))
                  }
                >
                  <option value={0}>-- Seleccionar --</option>
                  {RECURSOS_MOCK.map((r) => (
                    <option key={r.id_recurso} value={r.id_recurso}>
                      {r.nombre} ({r.unidad})
                    </option>
                  ))}
                </select>
              </div>
              <div className="campo">
                <label htmlFor="cantidad-encontrada">Cantidad</label>
                <input
                  id="cantidad-encontrada"
                  type="number"
                  value={cantidadEncontrada}
                  min={0}
                  onChange={(e) =>
                    setCantidadEncontrada(Number(e.target.value))
                  }
                />
              </div>
            </div>
            <button
              className="btn-primario"
              onClick={handleRegistrarEncontrado}
              disabled={cargando}
            >
              {cargando ? "Guardando..." : "Registrar encontrado"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      <div className="form-acciones">
        <button className="btn-secundario" onClick={onCerrar}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default RecursosMision;
