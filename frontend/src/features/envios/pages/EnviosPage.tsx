import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Truck,
  XCircle,
} from "lucide-react";
import { PageModal } from "../../../shared/components/PageModal";
import {
  CrudAction,
  CrudActionGroup,
  CrudActions,
} from "../../../shared/components/CrudActions";
import type { Campamento } from "../../campamentos/types";
import type { InventarioResource } from "../../inventario/types";
import type { Persona } from "../../personas/types";
import { getSolicitudesByCampamento } from "../../solicitudes/solicitudes.api";
import type { SolicitudCampamento } from "../../solicitudes/types";
import type { Envio, EnvioEstado, EnvioPayload } from "../types";
import {
  getEnviosByCampamento,
  confirmarSalida,
  confirmarLlegada,
  cancelarEnvio,
  createEnvio,
  updateEnvio,
  deleteEnvio,
} from "../envios.api";

type Props = {
  campamento: Campamento;
  campamentos: Campamento[];
  personas: Persona[];
  inventario: InventarioResource[];
  onDataChanged?: () => Promise<void> | void;
};

type RecursoSeleccionado = {
  id_recurso: number;
  nombre: string;
  unidad?: string;
  cantidad_enviada: number;
};

type PersonaSeleccionada = {
  id_persona: number;
  nombre: string;
  raciones_viaje: number;
};

type FormState = {
  id_solicitud: string;
  id_campamento_destino: string;
  fecha_salida_programada: string;
  fecha_llegada_programada: string;
  id_recurso: string;
  cantidad_recurso: string;
  id_persona: string;
  raciones_viaje: string;
};

type FiltrosEnvio = {
  estado: string;
  direccion: "TODOS" | "SALIENTES" | "ENTRANTES";
  fecha: string;
  solicitud: string;
  texto: string;
};

const emptyForm: FormState = {
  id_solicitud: "",
  id_campamento_destino: "",
  fecha_salida_programada: "",
  fecha_llegada_programada: "",
  id_recurso: "",
  cantidad_recurso: "",
  id_persona: "",
  raciones_viaje: "",
};

const emptyFiltros: FiltrosEnvio = {
  estado: "",
  direccion: "TODOS",
  fecha: "",
  solicitud: "",
  texto: "",
};

const ESTADO_LABEL: Record<EnvioEstado, string> = {
  PENDIENTE: "Pendiente",
  EN_TRANSITO: "En transito",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
};

const ESTADO_CLASS: Record<EnvioEstado, string> = {
  PENDIENTE: "status-badge status-pending",
  EN_TRANSITO: "status-badge status-active",
  COMPLETADO: "status-badge status-active",
  CANCELADO: "status-badge status-inactive",
};

const formatFecha = (fecha?: string | null) =>
  fecha
    ? new Date(fecha).toLocaleString("es-CR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const toDatetimeLocal = (fecha?: string | null) =>
  fecha ? new Date(fecha).toISOString().slice(0, 16) : "";

function EnviosPage({
  campamento,
  campamentos,
  personas,
  inventario,
  onDataChanged,
}: Props) {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudCampamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accionando, setAccionando] = useState<number | null>(null);
  const [envioEditando, setEnvioEditando] = useState<Envio | null>(null);
  const [envioDetalle, setEnvioDetalle] = useState<Envio | null>(null);
  const [envioLlegada, setEnvioLlegada] = useState<Envio | null>(null);
  const [cantidadesRecibidas, setCantidadesRecibidas] = useState<Record<number, string>>({});
  const [form, setForm] = useState<FormState>(emptyForm);
  const [recursosEnvio, setRecursosEnvio] = useState<RecursoSeleccionado[]>([]);
  const [personasEnvio, setPersonasEnvio] = useState<PersonaSeleccionada[]>([]);
  const [filtros, setFiltros] = useState<FiltrosEnvio>(emptyFiltros);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const campamentoId = campamento.id_campamento;

  const envioCumpleFiltros = (envio: Envio) => {
    if (filtros.estado && envio.estado !== filtros.estado) return false;
    if (filtros.direccion === "SALIENTES" && envio.id_campamento_origen !== campamentoId) return false;
    if (filtros.direccion === "ENTRANTES" && envio.id_campamento_destino !== campamentoId) return false;
    if (filtros.solicitud && String(envio.id_solicitud) !== filtros.solicitud.trim()) return false;
    if (filtros.fecha) {
      const salida = envio.fecha_salida_programada?.slice(0, 10);
      const llegada = envio.fecha_llegada_programada?.slice(0, 10);
      if (salida !== filtros.fecha && llegada !== filtros.fecha) return false;
    }
    if (filtros.texto.trim()) {
      const texto = filtros.texto.trim().toLowerCase();
      const recursos = (envio.envio_recurso ?? [])
        .map((item) => item.recurso?.nombre ?? "")
        .join(" ")
        .toLowerCase();
      const personasTexto = (envio.envio_persona ?? [])
        .map((item) =>
          item.persona ? `${item.persona.nombre} ${item.persona.apellidos}` : "",
        )
        .join(" ")
        .toLowerCase();

      if (!recursos.includes(texto) && !personasTexto.includes(texto)) return false;
    }

    return true;
  };

  const enviosFiltrados = envios.filter(envioCumpleFiltros);
  const enviosSalientes = enviosFiltrados.filter((e) => e.id_campamento_origen === campamentoId);
  const enviosEntrantes = enviosFiltrados.filter((e) => e.id_campamento_destino === campamentoId);

  const solicitudesDisponibles = useMemo(
    () =>
      solicitudes.filter((solicitud) => {
        const estadoValido = solicitud.estado === "APROBADA" || solicitud.estado === "AJUSTADA";
        const origenValido = solicitud.id_campamento_origen === campamentoId;
        const tieneEnvioActivo = (solicitud.envio ?? []).some(
          (envio) => envio.estado !== "CANCELADO",
        );
        return estadoValido && origenValido && !tieneEnvioActivo;
      }),
    [campamentoId, solicitudes],
  );

  const solicitudesConEnvio = useMemo(
    () =>
      solicitudes.filter((solicitud) => {
        const estadoValido = solicitud.estado === "APROBADA" || solicitud.estado === "AJUSTADA";
        const origenValido = solicitud.id_campamento_origen === campamentoId;
        const tieneEnvioActivo = (solicitud.envio ?? []).some(
          (envio) => envio.estado !== "CANCELADO",
        );
        return estadoValido && origenValido && tieneEnvioActivo;
      }),
    [campamentoId, solicitudes],
  );

  const campamentosDestino = campamentos.filter(
    (item) => item.activo !== false && item.id_campamento !== campamentoId,
  );

  const personasDisponibles = personas.filter((persona) => {
    const disponible = persona.estado_persona?.disponible ?? true;
    return persona.activo !== false && persona.id_campamento === campamentoId && disponible;
  });

  const recursosOrigen = useMemo(() => {
    const map = new Map<number, InventarioResource>();
    inventario
      .filter((resource) => resource.campId === campamentoId)
      .forEach((resource) => map.set(resource.id, resource));
    return Array.from(map.values());
  }, [inventario, campamentoId]);

  const cargarDatos = async () => {
    if (!campamentoId) return;
    try {
      setLoading(true);
      setError("");
      const [enviosData, solicitudesData] = await Promise.all([
        getEnviosByCampamento(campamentoId),
        getSolicitudesByCampamento(campamentoId),
      ]);
      setEnvios(enviosData);
      setSolicitudes(solicitudesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los envios");
    } finally {
      setLoading(false);
    }
  };

  const refrescarDespuesDeCambio = async () => {
    await cargarDatos();
    await onDataChanged?.();
  };

  useEffect(() => {
    void cargarDatos();
  }, [campamentoId]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const limpiarFormulario = () => {
    setForm(emptyForm);
    setEnvioEditando(null);
    setRecursosEnvio([]);
    setPersonasEnvio([]);
    setMostrarFormulario(false);
  };

  const abrirNuevoEnvio = () => {
    setForm(emptyForm);
    setEnvioEditando(null);
    setRecursosEnvio([]);
    setPersonasEnvio([]);
    setMostrarFormulario(true);
  };

  const seleccionarSolicitud = (idSolicitud: string) => {
    const solicitud = solicitudes.find((item) => String(item.id_solicitud) === idSolicitud);
    setForm((current) => ({
      ...current,
      id_solicitud: idSolicitud,
      id_campamento_destino: solicitud ? String(solicitud.id_campamento_destino) : "",
    }));

    if (!solicitud) return;

    const recursosSugeridos = (solicitud.solicitud_recurso ?? [])
      .map((item) => ({
        id_recurso: item.id_recurso,
        nombre: item.recurso?.nombre ?? `Recurso ${item.id_recurso}`,
        unidad: item.recurso?.unidad,
        cantidad_enviada: Number(item.cantidad_aprobada ?? item.cantidad_pedida),
      }))
      .filter((item) => item.cantidad_enviada > 0);

    setRecursosEnvio(recursosSugeridos);
  };

  const agregarRecurso = () => {
    const recurso = recursosOrigen.find((item) => String(item.id) === form.id_recurso);
    const cantidad = Number(form.cantidad_recurso);

    if (!recurso || !cantidad || cantidad <= 0) {
      setError("Seleccione un recurso e indique una cantidad mayor a 0.");
      return;
    }

    if (cantidad > recurso.quantity) {
      setError("La cantidad enviada no puede superar el stock disponible.");
      return;
    }

    setError("");
    setRecursosEnvio((current) => {
      const exists = current.find((item) => item.id_recurso === recurso.id);
      if (exists) {
        return current.map((item) =>
          item.id_recurso === recurso.id
            ? { ...item, cantidad_enviada: cantidad }
            : item,
        );
      }

      return [
        ...current,
        {
          id_recurso: recurso.id,
          nombre: recurso.name,
          cantidad_enviada: cantidad,
        },
      ];
    });
    updateField("id_recurso", "");
    updateField("cantidad_recurso", "");
  };

  const agregarPersona = () => {
    const persona = personasDisponibles.find((item) => String(item.id_persona) === form.id_persona);
    const raciones = Number(form.raciones_viaje || 0);

    if (!persona?.id_persona) {
      setError("Seleccione una persona disponible.");
      return;
    }

    setError("");
    setPersonasEnvio((current) => {
      const nombre = `${persona.nombre} ${persona.apellidos}`;
      const exists = current.find((item) => item.id_persona === persona.id_persona);

      if (exists) {
        return current.map((item) =>
          item.id_persona === persona.id_persona
            ? { ...item, raciones_viaje: raciones }
            : item,
        );
      }

      return [
        ...current,
        {
          id_persona: persona.id_persona!,
          nombre,
          raciones_viaje: raciones,
        },
      ];
    });
    updateField("id_persona", "");
    updateField("raciones_viaje", "");
  };

  const buildPayload = (): EnvioPayload => {
    if (!campamentoId) throw new Error("Seleccione un campamento origen.");
    if (!form.id_solicitud.trim()) throw new Error("Seleccione una solicitud aprobada o ajustada.");
    if (!form.id_campamento_destino) throw new Error("Seleccione destino.");
    if (!form.fecha_salida_programada || !form.fecha_llegada_programada) {
      throw new Error("Ingrese las fechas programadas.");
    }

    if (recursosEnvio.length === 0 && personasEnvio.length === 0) {
      throw new Error("Agregue al menos un recurso o una persona.");
    }

    return {
      id_solicitud: Number(form.id_solicitud),
      id_campamento_origen: campamentoId,
      id_campamento_destino: Number(form.id_campamento_destino),
      fecha_salida_programada: new Date(form.fecha_salida_programada).toISOString(),
      fecha_llegada_programada: new Date(form.fecha_llegada_programada).toISOString(),
      recursos: recursosEnvio.map((recurso) => ({
        id_recurso: recurso.id_recurso,
        cantidad_enviada: recurso.cantidad_enviada,
      })),
      personas: personasEnvio.map((persona) => ({
        id_persona: persona.id_persona,
        raciones_viaje: persona.raciones_viaje,
      })),
    };
  };

  const handleSubmit = async () => {
    try {
      setError("");
      const payload = buildPayload();

      if (envioEditando) {
        await updateEnvio(envioEditando.id_envio, {
          fecha_salida_programada: payload.fecha_salida_programada,
          fecha_llegada_programada: payload.fecha_llegada_programada,
          recursos: payload.recursos,
          personas: payload.personas,
        });
      } else {
        await createEnvio(payload);
      }

      limpiarFormulario();
      await refrescarDespuesDeCambio();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el envio");
    }
  };

  const iniciarEdicion = (envio: Envio) => {
    setEnvioEditando(envio);
    setForm({
      id_solicitud: String(envio.id_solicitud),
      id_campamento_destino: String(envio.id_campamento_destino),
      fecha_salida_programada: toDatetimeLocal(envio.fecha_salida_programada),
      fecha_llegada_programada: toDatetimeLocal(envio.fecha_llegada_programada),
      id_recurso: "",
      cantidad_recurso: "",
      id_persona: "",
      raciones_viaje: "",
    });
    setRecursosEnvio(
      (envio.envio_recurso ?? []).map((item) => ({
        id_recurso: item.id_recurso ?? 0,
        nombre: item.recurso?.nombre ?? "Recurso",
        unidad: item.recurso?.unidad,
        cantidad_enviada: Number(item.cantidad_enviada),
      })).filter((item) => item.id_recurso > 0),
    );
    setPersonasEnvio(
      (envio.envio_persona ?? []).map((item) => ({
        id_persona: item.id_persona ?? 0,
        nombre: item.persona
          ? `${item.persona.nombre} ${item.persona.apellidos}`
          : "Persona",
        raciones_viaje: Number(item.raciones_viaje),
      })).filter((item) => item.id_persona > 0),
    );
    setMostrarFormulario(true);
  };

  const abrirConfirmacionLlegada = (envio: Envio) => {
    const recursos = envio.envio_recurso ?? [];

    if (recursos.length === 0) {
      void handleAccion(envio.id_envio, "llegada");
      return;
    }

    setEnvioLlegada(envio);
    setCantidadesRecibidas(
      Object.fromEntries(
        recursos.map((item) => [
          item.id_envio_recurso,
          String(Number(item.cantidad_recibida ?? item.cantidad_enviada)),
        ]),
      ),
    );
  };

  const confirmarLlegadaConCantidades = async () => {
    if (!envioLlegada) return;
    if (!window.confirm(`Confirmar llegada del envio #${envioLlegada.id_envio}?`)) return;

    setAccionando(envioLlegada.id_envio);
    setError("");
    try {
      await confirmarLlegada(envioLlegada.id_envio, {
        recursos_recibidos: (envioLlegada.envio_recurso ?? []).map((item) => ({
          id_envio_recurso: item.id_envio_recurso,
          cantidad_recibida: Number(cantidadesRecibidas[item.id_envio_recurso] || 0),
        })),
      });
      setEnvioLlegada(null);
      setCantidadesRecibidas({});
      await refrescarDespuesDeCambio();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo confirmar la llegada");
    } finally {
      setAccionando(null);
    }
  };

  const handleAccion = async (
    idEnvio: number,
    accion: "salida" | "llegada" | "cancelar" | "eliminar",
  ) => {
    const mensajes: Record<typeof accion, string> = {
      salida: `Confirmar salida del envio #${idEnvio}?`,
      llegada: `Confirmar llegada del envio #${idEnvio}?`,
      cancelar: `Cancelar el envio #${idEnvio}?`,
      eliminar: `Eliminar definitivamente el envio #${idEnvio}?`,
    };

    if (!window.confirm(mensajes[accion])) return;

    setAccionando(idEnvio);
    setError("");
    try {
      if (accion === "salida") await confirmarSalida(idEnvio);
      else if (accion === "llegada") await confirmarLlegada(idEnvio);
      else if (accion === "cancelar") await cancelarEnvio(idEnvio);
      else await deleteEnvio(idEnvio);
      await refrescarDespuesDeCambio();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo realizar la accion");
    } finally {
      setAccionando(null);
    }
  };

  const renderHistorial = (envio: Envio) => {
    const bitacora = envio.historial?.bitacora ?? [];
    const movimientos = envio.historial?.movimientos_inventario ?? [];
    const asignaciones = envio.historial?.asignaciones_personas ?? [];

    if (!bitacora.length && !movimientos.length && !asignaciones.length) {
      return <div className="small-text">Sin historial relacionado.</div>;
    }

    return (
      <details>
        <summary>Ver historial</summary>
        <div className="campamento-mini-list" style={{ marginTop: "10px" }}>
          {bitacora.map((item) => (
            <article key={`b-${item.id_bitacora}`} className="campamento-mini-card">
              <strong>{item.tipo_accion}</strong>
              <span>{formatFecha(item.fecha_hora)}</span>
              <span>{item.descripcion ?? "Sin descripcion"}</span>
            </article>
          ))}
          {movimientos.map((item) => (
            <article key={`m-${item.id_movimiento}`} className="campamento-mini-card">
              <strong>{item.tipo}</strong>
              <span>
                {item.recurso?.nombre ?? "Recurso"}: {Number(item.cantidad)}{" "}
                {item.recurso?.unidad ?? ""}
              </span>
              <span>{item.campamento?.nombre ?? "Campamento"} - {formatFecha(item.fecha_hora)}</span>
            </article>
          ))}
          {asignaciones.slice(0, 4).map((item) => (
            <article key={`a-${item.id_asignacion}`} className="campamento-mini-card">
              <strong>{item.cargo?.nombre ?? "Cargo"}</strong>
              <span>{item.campamento?.nombre ?? "Campamento"}</span>
              <span>
                {formatFecha(item.fecha_inicio)} / {formatFecha(item.fecha_fin)}
              </span>
            </article>
          ))}
        </div>
      </details>
    );
  };

  const renderDetalleEnvio = (envio: Envio) => {
    const solicitud = solicitudes.find((item) => item.id_solicitud === envio.id_solicitud);
    const origen = envio.campamento_envio_id_campamento_origenTocampamento?.nombre ?? "Origen";
    const destino = envio.campamento_envio_id_campamento_destinoTocampamento?.nombre ?? "Destino";

    return (
      <div className="personas-modal-backdrop">
        <section className="personas-modal">
          <div className="card-header">
            <div>
              <h3>Detalle envio #{envio.id_envio}</h3>
              <p className="small-text">
                Solicitud #{envio.id_solicitud} {solicitud ? `- ${solicitud.tipo}` : ""}
              </p>
            </div>
            <button type="button" className="button button-secondary" onClick={() => setEnvioDetalle(null)}>
              Cerrar
            </button>
          </div>

          <div className="campamento-summary-grid">
            <div className="campamento-summary-item">
              <span>Estado</span>
              <strong>{ESTADO_LABEL[envio.estado]}</strong>
            </div>
            <div className="campamento-summary-item">
              <span>Origen</span>
              <strong>{origen}</strong>
            </div>
            <div className="campamento-summary-item">
              <span>Destino</span>
              <strong>{destino}</strong>
            </div>
          </div>

          <div className="campamento-mini-list">
            <article className="campamento-mini-card">
              <strong>Fechas</strong>
              <span>Salida programada: {formatFecha(envio.fecha_salida_programada)}</span>
              <span>Llegada programada: {formatFecha(envio.fecha_llegada_programada)}</span>
              <span>Salida real: {formatFecha(envio.fecha_salida_aprobada)}</span>
              <span>Llegada real: {formatFecha(envio.fecha_llegada_aprobada)}</span>
            </article>

            <article className="campamento-mini-card">
              <strong>Solicitud</strong>
              <span>Tipo: {solicitud?.tipo ?? "-"}</span>
              <span>Motivo: {solicitud?.motivo ?? "Sin motivo"}</span>
              <span>Respuesta: {solicitud?.respuesta ?? "-"}</span>
            </article>

            <article className="campamento-mini-card">
              <strong>Recursos</strong>
              {(envio.envio_recurso ?? []).length === 0 ? (
                <span>Sin recursos.</span>
              ) : (
                (envio.envio_recurso ?? []).map((item) => (
                  <span key={item.id_envio_recurso}>
                    {item.recurso?.nombre ?? "Recurso"}: enviado {Number(item.cantidad_enviada)}
                    {item.cantidad_recibida !== null && item.cantidad_recibida !== undefined
                      ? ` / recibido ${Number(item.cantidad_recibida)}`
                      : ""}
                  </span>
                ))
              )}
            </article>

            <article className="campamento-mini-card">
              <strong>Personas asignadas</strong>
              {(envio.envio_persona ?? []).length === 0 ? (
                <span>Sin personas.</span>
              ) : (
                (envio.envio_persona ?? []).map((item) => (
                  <span key={item.id_envio_persona}>
                    {item.persona ? `${item.persona.nombre} ${item.persona.apellidos}` : "Persona"} /
                    raciones: {Number(item.raciones_viaje)}
                  </span>
                ))
              )}
            </article>
          </div>

          <div style={{ marginTop: "20px" }}>{renderHistorial(envio)}</div>
        </section>
      </div>
    );
  };

  const renderTabla = (lista: Envio[], esSaliente: boolean) => {
    if (lista.length === 0) {
      return (
        <div className="empty-state">
          {esSaliente ? "No hay envios salientes." : "No hay envios entrantes."}
        </div>
      );
    }

    return (
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{esSaliente ? "Destino" : "Origen"}</th>
              <th>Estado</th>
              <th>Fechas</th>
              <th>Recursos</th>
              <th>Personas</th>
              <th>Historial</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((envio) => {
              const campamentoContrario = esSaliente
                ? envio.campamento_envio_id_campamento_destinoTocampamento?.nombre
                : envio.campamento_envio_id_campamento_origenTocampamento?.nombre;
              const ocupado = accionando === envio.id_envio;

              return (
                <tr key={envio.id_envio}>
                  <td>#{envio.id_envio}</td>
                  <td>{campamentoContrario ?? "-"}</td>
                  <td>
                    <span className={ESTADO_CLASS[envio.estado]}>
                      {ESTADO_LABEL[envio.estado]}
                    </span>
                  </td>
                  <td>
                    <div>Sale: {formatFecha(envio.fecha_salida_programada)}</div>
                    <div>Llega: {formatFecha(envio.fecha_llegada_programada)}</div>
                  </td>
                  <td>
                    {(envio.envio_recurso ?? []).length === 0 ? (
                      <span className="small-text">-</span>
                    ) : (
                      (envio.envio_recurso ?? []).map((r) => (
                        <div key={r.id_envio_recurso}>
                          {r.recurso?.nombre ?? "Recurso"}: {Number(r.cantidad_enviada)}{" "}
                          {r.recurso?.unidad ?? ""}
                          {r.cantidad_recibida !== null && r.cantidad_recibida !== undefined
                            ? ` / recibido ${Number(r.cantidad_recibida)}`
                            : ""}
                        </div>
                      ))
                    )}
                  </td>
                  <td>
                    {(envio.envio_persona ?? []).length === 0 ? (
                      <span className="small-text">-</span>
                    ) : (
                      (envio.envio_persona ?? []).map((p) => (
                        <div key={p.id_envio_persona}>
                          {p.persona ? `${p.persona.nombre} ${p.persona.apellidos}` : "Persona"}
                          {p.persona?.estado_persona ? ` (${p.persona.estado_persona.nombre})` : ""}
                        </div>
                      ))
                    )}
                  </td>
                  <td>{renderHistorial(envio)}</td>
                  <td>
                    <CrudActions layout="table">
                      <CrudActionGroup>
                        <CrudAction
                          label="Ver detalle"
                          icon={Eye}
                          onClick={() => setEnvioDetalle(envio)}
                        />
                        {esSaliente && envio.estado === "PENDIENTE" && (
                          <CrudAction
                            label="Editar"
                            icon={Pencil}
                            disabled={ocupado}
                            onClick={() => iniciarEdicion(envio)}
                          />
                        )}
                      </CrudActionGroup>

                      {esSaliente && envio.estado === "PENDIENTE" && (
                        <CrudActionGroup>
                          <CrudAction
                            label={ocupado ? "..." : "Confirmar salida"}
                            icon={Truck}
                            variant="primary"
                            disabled={ocupado}
                            loading={ocupado}
                            onClick={() =>
                              void handleAccion(envio.id_envio, "salida")
                            }
                          />
                        </CrudActionGroup>
                      )}

                      {!esSaliente && envio.estado === "EN_TRANSITO" && (
                        <CrudActionGroup>
                          <CrudAction
                            label={ocupado ? "..." : "Confirmar llegada"}
                            icon={MapPin}
                            variant="primary"
                            disabled={ocupado}
                            loading={ocupado}
                            onClick={() => abrirConfirmacionLlegada(envio)}
                          />
                        </CrudActionGroup>
                      )}

                      {(envio.estado === "PENDIENTE" ||
                        envio.estado === "EN_TRANSITO") && (
                        <CrudActionGroup>
                          <CrudAction
                            label={ocupado ? "..." : "Cancelar"}
                            icon={XCircle}
                            variant="danger-soft"
                            disabled={ocupado}
                            loading={ocupado}
                            onClick={() =>
                              void handleAccion(envio.id_envio, "cancelar")
                            }
                          />
                        </CrudActionGroup>
                      )}

                      {(envio.estado === "PENDIENTE" ||
                        envio.estado === "CANCELADO") && (
                        <CrudActionGroup>
                          <CrudAction
                            label={ocupado ? "..." : "Eliminar"}
                            icon={Trash2}
                            variant="danger"
                            disabled={ocupado}
                            loading={ocupado}
                            onClick={() =>
                              void handleAccion(envio.id_envio, "eliminar")
                            }
                          />
                        </CrudActionGroup>
                      )}
                    </CrudActions>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <section className="campamento-detail-section">
      <div className="detail-section-title">
        <div>
          <h4>Envios</h4>
          <span>{envios.length} registros asociados a este campamento</span>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={abrirNuevoEnvio}
        >
          <Plus size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
          Nuevo envio
        </button>
      </div>

      {error && !mostrarFormulario && <div className="error-box">{error}</div>}

      <section className="campamentos-filter-card">
        <div className="campamentos-filter-row">
          <label className="filter-field">
            <span>Estado</span>
            <select
              value={filtros.estado}
              onChange={(event) =>
                setFiltros((current) => ({ ...current, estado: event.target.value }))
              }
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_TRANSITO">En transito</option>
              <option value="COMPLETADO">Completado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </label>

          <label className="filter-field">
            <span>Direccion</span>
            <select
              value={filtros.direccion}
              onChange={(event) =>
                setFiltros((current) => ({
                  ...current,
                  direccion: event.target.value as FiltrosEnvio["direccion"],
                }))
              }
            >
              <option value="TODOS">Todos</option>
              <option value="SALIENTES">Salientes</option>
              <option value="ENTRANTES">Entrantes</option>
            </select>
          </label>

          <label className="filter-field">
            <span>Fecha</span>
            <input
              type="date"
              value={filtros.fecha}
              onChange={(event) =>
                setFiltros((current) => ({ ...current, fecha: event.target.value }))
              }
            />
          </label>

          <label className="filter-field">
            <span>Solicitud</span>
            <input
              type="number"
              min="1"
              value={filtros.solicitud}
              onChange={(event) =>
                setFiltros((current) => ({ ...current, solicitud: event.target.value }))
              }
            />
          </label>

          <label className="filter-field">
            <span>Recurso o persona</span>
            <input
              value={filtros.texto}
              onChange={(event) =>
                setFiltros((current) => ({ ...current, texto: event.target.value }))
              }
            />
          </label>

          <div style={{ display: "flex", alignItems: "end" }}>
            <button type="button" className="button button-secondary" onClick={() => setFiltros(emptyFiltros)}>
              Limpiar filtros
            </button>
          </div>
        </div>
      </section>

      {mostrarFormulario && (
        <PageModal
          title={envioEditando ? `Editar envio #${envioEditando.id_envio}` : "Nuevo envio"}
          onClose={limpiarFormulario}
          size="lg"
        >
          <div className="modal-form">
            <p className="section-description">
              Vincula una solicitud aprobada, define fechas y agrega recursos o
              personas al envio.
            </p>

            <div className="modal-form__section">
              <h3 className="modal-form__section-title">Datos del envío</h3>

              <label className="form-field">
                <span>Solicitud aprobada/ajustada</span>
                <select
                  value={form.id_solicitud}
                  disabled={Boolean(envioEditando)}
                  onChange={(event) => seleccionarSolicitud(event.target.value)}
                >
                  <option value="">Seleccione solicitud disponible</option>
                  {envioEditando && (
                    <option value={envioEditando.id_solicitud}>
                      Solicitud #{envioEditando.id_solicitud}
                    </option>
                  )}
                  {solicitudesDisponibles.map((solicitud) => (
                    <option key={solicitud.id_solicitud} value={solicitud.id_solicitud}>
                      #{solicitud.id_solicitud} - {solicitud.tipo} - {solicitud.motivo ?? "Sin motivo"}
                    </option>
                  ))}
                  {solicitudesConEnvio.map((solicitud) => {
                    const envio = (solicitud.envio ?? []).find(
                      (item) => item.estado !== "CANCELADO",
                    );

                    return (
                      <option
                        key={`ocupada-${solicitud.id_solicitud}`}
                        value={`ocupada-${solicitud.id_solicitud}`}
                        disabled
                      >
                        #{solicitud.id_solicitud} - ya tiene envio #{envio?.id_envio ?? "-"} ({envio?.estado ?? "activo"})
                      </option>
                    );
                  })}
                </select>
              </label>

              <div className="modal-form__row">
                <label className="form-field">
                  <span>Campamento destino</span>
                  <select
                    value={form.id_campamento_destino}
                    disabled={Boolean(envioEditando) || Boolean(form.id_solicitud)}
                    onChange={(event) => updateField("id_campamento_destino", event.target.value)}
                  >
                    <option value="">Seleccione destino</option>
                    {campamentosDestino.map((item) => (
                      <option key={item.id_campamento} value={item.id_campamento}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Salida programada</span>
                  <input type="datetime-local" value={form.fecha_salida_programada} onChange={(event) => updateField("fecha_salida_programada", event.target.value)} />
                </label>
              </div>

              <label className="form-field">
                <span>Llegada programada</span>
                <input type="datetime-local" value={form.fecha_llegada_programada} onChange={(event) => updateField("fecha_llegada_programada", event.target.value)} />
              </label>
            </div>

            <div className="modal-form__section">
              <h3 className="modal-form__section-title">Agregar recursos</h3>
              <div className="modal-form__row">
                <label className="form-field">
                  <span>Recurso</span>
                  <select value={form.id_recurso} onChange={(event) => updateField("id_recurso", event.target.value)}>
                    <option value="">Seleccione recurso</option>
                    {recursosOrigen.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.quantity})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Cantidad enviada</span>
                  <input type="number" min="0" value={form.cantidad_recurso} onChange={(event) => updateField("cantidad_recurso", event.target.value)} />
                </label>
              </div>

              <button type="button" className="button button-secondary" onClick={agregarRecurso}>
                Agregar recurso
              </button>
            </div>

            <div className="modal-form__section">
              <h3 className="modal-form__section-title">Agregar personas</h3>
              <div className="modal-form__row">
                <label className="form-field">
                  <span>Persona</span>
                  <select value={form.id_persona} onChange={(event) => updateField("id_persona", event.target.value)}>
                    <option value="">Seleccione persona</option>
                    {personasDisponibles.map((persona) => (
                      <option key={persona.id_persona} value={persona.id_persona}>
                        {persona.nombre} {persona.apellidos}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Raciones de viaje</span>
                  <input type="number" min="0" value={form.raciones_viaje} onChange={(event) => updateField("raciones_viaje", event.target.value)} />
                </label>
              </div>

              <button type="button" className="button button-secondary" onClick={agregarPersona}>
                Agregar persona
              </button>
            </div>

            <div className="modal-form__section">
              <h3 className="modal-form__section-title">Resumen del envío</h3>

              <div className="campamento-mini-list">
              <article className="campamento-mini-card">
                <strong>Recursos del envio</strong>
                {recursosEnvio.length === 0 ? (
                  <span>Sin recursos agregados.</span>
                ) : (
                  recursosEnvio.map((item) => (
                    <span key={item.id_recurso}>
                      {item.nombre}: {item.cantidad_enviada} {item.unidad ?? ""}
                      <button
                        type="button"
                        className="button button-danger"
                        style={{ marginLeft: "10px", padding: "6px 10px" }}
                        onClick={() => setRecursosEnvio((current) => current.filter((recurso) => recurso.id_recurso !== item.id_recurso))}
                      >
                        Quitar
                      </button>
                    </span>
                  ))
                )}
              </article>

              <article className="campamento-mini-card">
                <strong>Personas del envio</strong>
                {personasEnvio.length === 0 ? (
                  <span>Sin personas agregadas.</span>
                ) : (
                  personasEnvio.map((item) => (
                    <span key={item.id_persona}>
                      {item.nombre} / raciones: {item.raciones_viaje}
                      <button
                        type="button"
                        className="button button-danger"
                        style={{ marginLeft: "10px", padding: "6px 10px" }}
                        onClick={() => setPersonasEnvio((current) => current.filter((persona) => persona.id_persona !== item.id_persona))}
                      >
                        Quitar
                      </button>
                    </span>
                  ))
                )}
              </article>
            </div>
            </div>

            {error && <div className="error-box">{error}</div>}

            <div className="modal-form__actions">
              <button type="button" className="button button-secondary" onClick={limpiarFormulario}>
                Cancelar
              </button>
              <button type="button" className="button button-primary" onClick={() => void handleSubmit()}>
                {envioEditando ? "Guardar cambios" : "Crear envio"}
              </button>
            </div>
          </div>
        </PageModal>
      )}

      {loading ? (
        <div className="empty-state">Cargando envios...</div>
      ) : (
        <>
          <div className="detail-section-title" style={{ marginTop: "28px" }}>
            <h4>Salientes</h4>
            <span>{enviosSalientes.length}</span>
          </div>
          {renderTabla(enviosSalientes, true)}

          <div className="detail-section-title" style={{ marginTop: "28px" }}>
            <h4>Entrantes</h4>
            <span>{enviosEntrantes.length}</span>
          </div>
          {renderTabla(enviosEntrantes, false)}
        </>
      )}

      {envioLlegada && (
        <div className="personas-modal-backdrop">
          <section className="personas-modal">
            <div className="card-header">
              <div>
                <h3>Confirmar llegada #{envioLlegada.id_envio}</h3>
                <p className="small-text">Registra la cantidad recibida por recurso.</p>
              </div>
            </div>

            <div className="campamento-mini-list">
              {(envioLlegada.envio_recurso ?? []).map((item) => (
                <label className="form-field" key={item.id_envio_recurso}>
                  <span>
                    {item.recurso?.nombre ?? "Recurso"} enviado: {Number(item.cantidad_enviada)} {item.recurso?.unidad ?? ""}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={cantidadesRecibidas[item.id_envio_recurso] ?? ""}
                    onChange={(event) =>
                      setCantidadesRecibidas((current) => ({
                        ...current,
                        [item.id_envio_recurso]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
              <button type="button" className="button button-primary" onClick={() => void confirmarLlegadaConCantidades()}>
                Confirmar llegada
              </button>
              <button type="button" className="button button-secondary" onClick={() => setEnvioLlegada(null)}>
                Cancelar
              </button>
            </div>
          </section>
        </div>
      )}

      {envioDetalle && renderDetalleEnvio(envioDetalle)}
    </section>
  );
}

export default EnviosPage;
