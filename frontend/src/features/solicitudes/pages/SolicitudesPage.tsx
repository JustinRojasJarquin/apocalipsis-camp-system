import { useEffect, useMemo, useState } from "react";
import { Check, Plus, SlidersHorizontal, X } from "lucide-react";
import { PageModal } from "../../../shared/components/PageModal";
import {
  CrudAction,
  CrudActionGroup,
  CrudActions,
} from "../../../shared/components/CrudActions";
import type { Campamento } from "../../campamentos/types";
import type { InventarioResource } from "../../inventario/types";
import type { Persona } from "../../personas/types";
import { apiClient } from "../../../services/api.client";

type SolicitudEstado = "PENDIENTE" | "APROBADA" | "RECHAZADA" | "AJUSTADA";
type SolicitudTipo = "RECURSOS" | "PERSONAS" | "MIXTA";

type SolicitudCampamento = {
  id_solicitud: number;
  id_campamento_origen: number;
  id_campamento_destino: number;
  tipo: SolicitudTipo;
  estado: SolicitudEstado;
  motivo?: string | null;
  respuesta?: string | null;
  solicitud_recurso?: Array<{
    id_solicitud_rec: number;
    id_recurso: number;
    cantidad_pedida: number;
    cantidad_aprobada?: number | null;
    recurso?: {
      nombre: string;
      unidad?: string;
    };
  }>;
  solicitud_persona?: Array<{
    id_solicitud_per: number;
    id_cargo: number;
    cantidad_personas: number;
    cargo?: {
      nombre: string;
    };
  }>;
  envio?: Array<{
    id_envio: number;
    estado: "PENDIENTE" | "EN_TRANSITO" | "COMPLETADO" | "CANCELADO";
    envio_persona?: Array<{
      id_envio_persona: number;
      persona?: { nombre: string; apellidos: string };
      raciones_viaje: number;
    }>;
    envio_recurso?: Array<{
      id_envio_recurso: number;
      cantidad_enviada: number;
      cantidad_recibida?: number | null;
      recurso?: { nombre: string; unidad?: string };
    }>;
  }>;
};

type Props = {
  campamento: Campamento;
  campamentos: Campamento[];
  inventario: InventarioResource[];
  personas: Persona[];
};

function SolicitudesPage({
  campamento,
  campamentos,
  inventario,
  personas,
}: Props) {
  const [solicitudes, setSolicitudes] = useState<SolicitudCampamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [destinoId, setDestinoId] = useState("");
  const [tipo, setTipo] = useState<SolicitudTipo>("RECURSOS");
  const [motivo, setMotivo] = useState("");
  const [recursoId, setRecursoId] = useState("");
  const [cantidadRecurso, setCantidadRecurso] = useState("");
  const [cargoId, setCargoId] = useState("");
  const [cantidadPersonas, setCantidadPersonas] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const campamentoId = campamento.id_campamento;

  const campamentosDestino = campamentos.filter(
    (item) => item.activo !== false && item.id_campamento !== campamentoId,
  );

  const recursosDisponibles = useMemo(() => {
    const map = new Map<number, InventarioResource>();

    inventario.forEach((item) => {
      map.set(item.id, item);
    });

    return Array.from(map.values());
  }, [inventario]);

  const cargosDisponibles = useMemo(() => {
    const map = new Map<number, { id_cargo: number; nombre: string }>();

    personas.forEach((persona) => {
      const cargo = persona.cargo as
        | { id_cargo?: number; nombre?: string }
        | undefined;

      if (cargo?.id_cargo && cargo.nombre) {
        map.set(cargo.id_cargo, {
          id_cargo: cargo.id_cargo,
          nombre: cargo.nombre,
        });
      }
    });

    return Array.from(map.values());
  }, [personas]);

  const solicitudesRecibidas = solicitudes.filter(
    (item) => item.id_campamento_destino === campamentoId,
  );

  const solicitudesEnviadas = solicitudes.filter(
    (item) => item.id_campamento_origen === campamentoId,
  );

  const cargarSolicitudes = async () => {
    if (!campamentoId) return;

    try {
      setLoading(true);
      setError("");

      const response = await apiClient(
        `/solicitudes?id_campamento=${campamentoId}`,
      );

      setSolicitudes(response.data ?? response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las solicitudes",
      );
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarSolicitudes();
  }, [campamentoId]);

  const limpiarFormulario = () => {
    setDestinoId("");
    setTipo("RECURSOS");
    setMotivo("");
    setRecursoId("");
    setCantidadRecurso("");
    setCargoId("");
    setCantidadPersonas("");
    setMostrarFormulario(false);
  };

  const handleCrearSolicitud = async () => {
    if (!campamentoId) return;

    if (!destinoId) {
      setError("Seleccione el campamento destino.");
      return;
    }

    if (!motivo.trim()) {
      setError("Ingrese el motivo de la solicitud.");
      return;
    }

    const recursos =
      tipo === "RECURSOS" || tipo === "MIXTA"
        ? recursoId && cantidadRecurso
          ? [
              {
                id_recurso: Number(recursoId),
                cantidad_pedida: Number(cantidadRecurso),
              },
            ]
          : []
        : [];

    const personasSolicitadas =
      tipo === "PERSONAS" || tipo === "MIXTA"
        ? cargoId && cantidadPersonas
          ? [
              {
                id_cargo: Number(cargoId),
                cantidad_personas: Number(cantidadPersonas),
              },
            ]
          : []
        : [];

    if (
      (tipo === "RECURSOS" && recursos.length === 0) ||
      (tipo === "PERSONAS" && personasSolicitadas.length === 0) ||
      (tipo === "MIXTA" &&
        recursos.length === 0 &&
        personasSolicitadas.length === 0)
    ) {
      setError("Agregue recursos o personas a la solicitud.");
      return;
    }

    try {
      setError("");

      await apiClient("/solicitudes", {
        method: "POST",
        body: JSON.stringify({
          id_campamento_origen: campamentoId,
          id_campamento_destino: Number(destinoId),
          tipo,
          motivo,
          recursos,
          personas: personasSolicitadas,
        }),
      });

      limpiarFormulario();
      await cargarSolicitudes();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo crear la solicitud",
      );
    }
  };

  const handleResponder = async (
    idSolicitud: number,
    estado: SolicitudEstado,
  ) => {
    try {
      setError("");

      await apiClient(`/solicitudes/${idSolicitud}/responder`, {
        method: "PATCH",
        body: JSON.stringify({
          estado,
          respuesta: `Solicitud ${estado.toLowerCase()}`,
        }),
      });

      await cargarSolicitudes();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo responder la solicitud",
      );
    }
  };

  return (
    <section className="campamento-detail-section">
      <div className="detail-section-title">
        <div>
          <h4>Solicitudes</h4>
          <span>{solicitudes.length} registros asociados a este campamento</span>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={() => setMostrarFormulario(true)}
        >
          <Plus size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
          Nueva solicitud
        </button>
      </div>

      {error && !mostrarFormulario && <div className="error-box">{error}</div>}

      {mostrarFormulario && (
        <PageModal
          title="Nueva solicitud"
          onClose={limpiarFormulario}
          size="lg"
        >
          <div className="modal-form">
            <p className="section-description">
              Solicita recursos o personas a otro campamento indicando el
              motivo y los detalles requeridos.
            </p>

            <div className="modal-form__section">
              <h3 className="modal-form__section-title">Datos generales</h3>

              <label className="form-field">
                <span>Campamento destino *</span>
                <select
                  value={destinoId}
                  onChange={(event) => setDestinoId(event.target.value)}
                >
                  <option value="">Seleccione destino</option>
                  {campamentosDestino.map((item) => (
                    <option key={item.id_campamento} value={item.id_campamento}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <div className="modal-form__row">
                <label className="form-field">
                  <span>Tipo *</span>
                  <select
                    value={tipo}
                    onChange={(event) => setTipo(event.target.value as SolicitudTipo)}
                  >
                    <option value="RECURSOS">Recursos</option>
                    <option value="PERSONAS">Personas</option>
                    <option value="MIXTA">Mixta</option>
                  </select>
                </label>
              </div>

              <label className="form-field">
                <span>Motivo *</span>
                <textarea
                  value={motivo}
                  onChange={(event) => setMotivo(event.target.value)}
                  placeholder="Motivo de la solicitud..."
                  rows={3}
                />
              </label>
            </div>

            {(tipo === "RECURSOS" || tipo === "MIXTA") && (
              <div className="modal-form__section">
                <h3 className="modal-form__section-title">Recursos solicitados</h3>

                <div className="modal-form__row">
                  <label className="form-field">
                    <span>Recurso</span>
                    <select
                      value={recursoId}
                      onChange={(event) => setRecursoId(event.target.value)}
                    >
                      <option value="">Seleccione recurso</option>
                      {recursosDisponibles.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="form-field">
                    <span>Cantidad</span>
                    <input
                      type="number"
                      min="1"
                      value={cantidadRecurso}
                      onChange={(event) => setCantidadRecurso(event.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}

            {(tipo === "PERSONAS" || tipo === "MIXTA") && (
              <div className="modal-form__section">
                <h3 className="modal-form__section-title">Personas solicitadas</h3>

                <div className="modal-form__row">
                  <label className="form-field">
                    <span>Cargo requerido</span>
                    <select
                      value={cargoId}
                      onChange={(event) => setCargoId(event.target.value)}
                    >
                      <option value="">Seleccione cargo</option>
                      {cargosDisponibles.map((cargo) => (
                        <option key={cargo.id_cargo} value={cargo.id_cargo}>
                          {cargo.nombre}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="form-field">
                    <span>Cantidad de personas</span>
                    <input
                      type="number"
                      min="1"
                      value={cantidadPersonas}
                      onChange={(event) => setCantidadPersonas(event.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}

            {error && <div className="error-box">{error}</div>}

            <div className="modal-form__actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={limpiarFormulario}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={() => void handleCrearSolicitud()}
              >
                Crear solicitud
              </button>
            </div>
          </div>
        </PageModal>
      )}

      <div className="detail-section-title" style={{ marginTop: "28px" }}>
        <h4>Recibidas</h4>
        <span>{solicitudesRecibidas.length}</span>
      </div>

      {loading ? (
        <div className="empty-state">Cargando solicitudes...</div>
      ) : solicitudesRecibidas.length === 0 ? (
        <div className="empty-state">No hay solicitudes recibidas.</div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Motivo</th>
                <th>Detalle</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {solicitudesRecibidas.map((solicitud) => (
                <tr key={solicitud.id_solicitud}>
                  <td>{solicitud.id_solicitud}</td>
                  <td>{solicitud.tipo}</td>
                  <td>{solicitud.estado}</td>
                  <td>{solicitud.motivo ?? "Sin motivo"}</td>
                  <td>
                    {(solicitud.solicitud_recurso ?? []).map((recurso) => (
                      <div key={recurso.id_solicitud_rec}>
                        {recurso.recurso?.nombre ?? "Recurso"}:{" "}
                        {String(recurso.cantidad_pedida)}
                      </div>
                    ))}

                    {(solicitud.solicitud_persona ?? []).map((persona) => (
                      <div key={persona.id_solicitud_per}>
                        {persona.cargo?.nombre ?? "Cargo"}:{" "}
                        {persona.cantidad_personas}
                      </div>
                    ))}

                    {(solicitud.envio ?? []).flatMap((envio) =>
                      (envio.envio_persona ?? []).map((personaEnvio) => (
                        <div key={`ep-${envio.id_envio}-${personaEnvio.id_envio_persona}`}>
                          Asignada:{" "}
                          {personaEnvio.persona
                            ? `${personaEnvio.persona.nombre} ${personaEnvio.persona.apellidos}`
                            : "Persona"}
                        </div>
                      )),
                    )}
                  </td>
                  <td>
                    {solicitud.estado === "PENDIENTE" ? (
                      <CrudActions layout="table">
                        <CrudActionGroup>
                          <CrudAction
                            label="Aprobar"
                            icon={Check}
                            variant="success"
                            onClick={() =>
                              void handleResponder(
                                solicitud.id_solicitud,
                                "APROBADA",
                              )
                            }
                          />
                          <CrudAction
                            label="Ajustar"
                            icon={SlidersHorizontal}
                            onClick={() =>
                              void handleResponder(
                                solicitud.id_solicitud,
                                "AJUSTADA",
                              )
                            }
                          />
                        </CrudActionGroup>
                        <CrudActionGroup>
                          <CrudAction
                            label="Rechazar"
                            icon={X}
                            variant="danger"
                            onClick={() =>
                              void handleResponder(
                                solicitud.id_solicitud,
                                "RECHAZADA",
                              )
                            }
                          />
                        </CrudActionGroup>
                      </CrudActions>
                    ) : (
                      "Procesada"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="detail-section-title" style={{ marginTop: "28px" }}>
        <h4>Enviadas</h4>
        <span>{solicitudesEnviadas.length}</span>
      </div>

      {solicitudesEnviadas.length === 0 ? (
        <div className="empty-state">No hay solicitudes enviadas.</div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Motivo</th>
              </tr>
            </thead>

            <tbody>
              {solicitudesEnviadas.map((solicitud) => (
                <tr key={solicitud.id_solicitud}>
                  <td>{solicitud.id_solicitud}</td>
                  <td>{solicitud.tipo}</td>
                  <td>{solicitud.estado}</td>
                  <td>{solicitud.motivo ?? "Sin motivo"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default SolicitudesPage;
