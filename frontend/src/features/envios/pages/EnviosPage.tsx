import { useEffect, useState } from "react";
import type { Campamento } from "../../campamentos/types";
import type { Envio, EnvioEstado } from "../types";
import {
  getEnviosByCampamento,
  confirmarSalida,
  confirmarLlegada,
  cancelarEnvio,
} from "../envios.api";

type Props = {
  campamento: Campamento;
};

const ESTADO_LABEL: Record<EnvioEstado, string> = {
  PENDIENTE: "Pendiente",
  EN_TRANSITO: "En tránsito",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
};

const ESTADO_CLASS: Record<EnvioEstado, string> = {
  PENDIENTE: "status-badge status-pending",
  EN_TRANSITO: "status-badge status-active",
  COMPLETADO: "status-badge status-active",
  CANCELADO: "status-badge status-inactive",
};

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function EnviosPage({ campamento }: Props) {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accionando, setAccionando] = useState<number | null>(null);

  const campamentoId = campamento.id_campamento;

  const enviosSalientes = envios.filter(
    (e) => e.id_campamento_origen === campamentoId,
  );
  const enviosEntrantes = envios.filter(
    (e) => e.id_campamento_destino === campamentoId,
  );

  const cargarEnvios = async () => {
    if (!campamentoId) return;
    try {
      setLoading(true);
      setError("");
      const data = await getEnviosByCampamento(campamentoId);
      setEnvios(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los envíos",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarEnvios();
  }, [campamentoId]);

  const handleAccion = async (
    idEnvio: number,
    accion: "salida" | "llegada" | "cancelar",
  ) => {
    setAccionando(idEnvio);
    setError("");
    try {
      if (accion === "salida") await confirmarSalida(idEnvio);
      else if (accion === "llegada") await confirmarLlegada(idEnvio);
      else await cancelarEnvio(idEnvio);
      await cargarEnvios();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo realizar la acción",
      );
    } finally {
      setAccionando(null);
    }
  };

  const renderTabla = (lista: Envio[], esSaliente: boolean) => {
    if (lista.length === 0) {
      return (
        <div className="empty-state">
          {esSaliente
            ? "No hay envíos salientes."
            : "No hay envíos entrantes."}
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
              <th>Salida prog.</th>
              <th>Llegada prog.</th>
              <th>Recursos</th>
              <th>Personas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((envio) => {
              const campamentoContrario = esSaliente
                ? envio.campamento_envio_id_campamento_destinoTocampamento
                    ?.nombre
                : envio.campamento_envio_id_campamento_origenTocampamento
                    ?.nombre;

              const ocupado = accionando === envio.id_envio;

              return (
                <tr key={envio.id_envio}>
                  <td>#{envio.id_envio}</td>
                  <td>{campamentoContrario ?? "—"}</td>
                  <td>
                    <span className={ESTADO_CLASS[envio.estado]}>
                      {ESTADO_LABEL[envio.estado]}
                    </span>
                  </td>
                  <td>{formatFecha(envio.fecha_salida_programada)}</td>
                  <td>{formatFecha(envio.fecha_llegada_programada)}</td>
                  <td>
                    {(envio.envio_recurso ?? []).length === 0 ? (
                      <span style={{ color: "#64748b" }}>—</span>
                    ) : (
                      (envio.envio_recurso ?? []).map((r, i) => (
                        <div key={i}>
                          {r.recurso?.nombre ?? "Recurso"}:{" "}
                          {Number(r.cantidad_enviada)}{" "}
                          {r.recurso?.unidad ?? ""}
                        </div>
                      ))
                    )}
                  </td>
                  <td>
                    {(envio.envio_persona ?? []).length === 0 ? (
                      <span style={{ color: "#64748b" }}>—</span>
                    ) : (
                      (envio.envio_persona ?? []).map((p, i) => (
                        <div key={i}>
                          {p.persona
                            ? `${p.persona.nombre} ${p.persona.apellidos}`
                            : "Persona"}
                        </div>
                      ))
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {esSaliente && envio.estado === "PENDIENTE" && (
                        <button
                          className="button button-primary"
                          disabled={ocupado}
                          onClick={() =>
                            void handleAccion(envio.id_envio, "salida")
                          }
                        >
                          {ocupado ? "..." : "Confirmar salida"}
                        </button>
                      )}

                      {!esSaliente && envio.estado === "EN_TRANSITO" && (
                        <button
                          className="button button-primary"
                          disabled={ocupado}
                          onClick={() =>
                            void handleAccion(envio.id_envio, "llegada")
                          }
                        >
                          {ocupado ? "..." : "Confirmar llegada"}
                        </button>
                      )}

                      {(envio.estado === "PENDIENTE" ||
                        envio.estado === "EN_TRANSITO") && (
                        <button
                          className="button button-danger"
                          disabled={ocupado}
                          onClick={() =>
                            void handleAccion(envio.id_envio, "cancelar")
                          }
                        >
                          {ocupado ? "..." : "Cancelar"}
                        </button>
                      )}

                      {envio.estado === "COMPLETADO" && (
                        <span style={{ color: "#22c55e", fontWeight: 600 }}>
                          Completado
                        </span>
                      )}

                      {envio.estado === "CANCELADO" && (
                        <span style={{ color: "#64748b" }}>Cancelado</span>
                      )}
                    </div>
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
        <h4>Envíos</h4>
        <span>{envios.length} registros asociados a este campamento</span>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="empty-state">Cargando envíos...</div>
      ) : (
        <>
          <div
            className="detail-section-title"
            style={{ marginTop: "12px" }}
          >
            <h4>Salientes</h4>
            <span>{enviosSalientes.length}</span>
          </div>
          {renderTabla(enviosSalientes, true)}

          <div
            className="detail-section-title"
            style={{ marginTop: "28px" }}
          >
            <h4>Entrantes</h4>
            <span>{enviosEntrantes.length}</span>
          </div>
          {renderTabla(enviosEntrantes, false)}
        </>
      )}
    </section>
  );
}

export default EnviosPage;
