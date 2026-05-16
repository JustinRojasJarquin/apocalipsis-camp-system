import { useEffect, useState } from "react";
import Navbar from "../../../shared/components/Navbar";
import { getCampamentos } from "../../campamentos/campamentos.api";
import CargosManager from "../components/CargosManager";
import EstadosManager from "../components/EstadosManager";
import PersonaDetalle from "../components/PersonaDetalle";
import PersonaForm from "../components/PersonaForm";
import PersonaTabla from "../components/PersonaTabla";
import {
  deletePersona,
  getCargos,
  getEstados,
  getPersonaById,
  getPersonas,
} from "../personas.api";
import type {
  Persona,
  PersonaCampamento,
  PersonaCargo,
  PersonaEstado,
  PersonaFilters,
} from "../types";

type PersonasTab = "lista" | "formulario" | "cargos" | "estados";

const emptyFilters: PersonaFilters = {
  buscar: "",
  id_campamento: "",
  id_cargo: "",
  id_estado: "",
};

function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [campamentos, setCampamentos] = useState<PersonaCampamento[]>([]);
  const [cargos, setCargos] = useState<PersonaCargo[]>([]);
  const [estados, setEstados] = useState<PersonaEstado[]>([]);
  const [filters, setFilters] = useState<PersonaFilters>(emptyFilters);
  const [personaEditando, setPersonaEditando] = useState<Persona | null>(null);
  const [personaDetalle, setPersonaDetalle] = useState<Persona | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [activeTab, setActiveTab] = useState<PersonasTab>("lista");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(personas.length / pageSize));
  const personasPagina = personas.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const loadData = async (nextFilters: PersonaFilters = filters) => {
    setLoading(true);
    setError(null);

    try {
      const [personasData, campamentosData, cargosData, estadosData] =
        await Promise.all([
        getPersonas(nextFilters),
        getCampamentos(),
        getCargos(),
        getEstados(),
      ]);

      setPersonas(personasData.filter((persona) => persona.activo !== false));
      setCargos(cargosData);
      setEstados(estadosData);

      setCampamentos(
        campamentosData
          .filter((campamento) => campamento.id_campamento !== undefined)
          .map((campamento) => ({
            id_campamento: campamento.id_campamento as number,
            nombre: campamento.nombre,
          })),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las personas.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData(filters);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [filters]);

  const handleFilterChange = (field: keyof PersonaFilters, value: string) => {
    setCurrentPage(1);
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleView = async (persona: Persona) => {
    if (!persona.id_persona) return;

    setError(null);

    try {
      setPersonaDetalle(await getPersonaById(persona.id_persona));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cargar el detalle.",
      );
    }
  };

  const handleEdit = (persona: Persona) => {
    setPersonaEditando(persona);
    setActiveTab("formulario");
  };

  const handleDelete = async (persona: Persona) => {
    if (!persona.id_persona) return;

    const confirmed = window.confirm(
      `Deseas desactivar a "${persona.nombre} ${persona.apellidos}"?`,
    );

    if (!confirmed) return;

    setIsDeletingId(persona.id_persona);
    setError(null);

    try {
      await deletePersona(persona.id_persona);

      if (personaEditando?.id_persona === persona.id_persona) {
        setPersonaEditando(null);
      }

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar la persona.",
      );
    } finally {
      setIsDeletingId(null);
    }
  };

  const tabButtonStyle = (tab: PersonasTab): React.CSSProperties => ({
    border: activeTab === tab ? "1px solid #3b82f6" : "1px solid #334155",
    background:
      activeTab === tab
        ? "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(59,130,246,0.08))"
        : "rgba(15,23,42,0.88)",
    color: activeTab === tab ? "#f8fafc" : "#cbd5e1",
    padding: "14px 18px",
    borderRadius: "16px",
    cursor: "pointer",
    fontWeight: 800,
  });

  const exportCsv = () => {
    const headers = [
      "Cedula",
      "Nombre",
      "Apellidos",
      "Campamento",
      "Cargo",
      "Estado",
      "Codigo",
    ];

    const escapeCsv = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const rows = personas.map((persona) => [
      persona.cedula,
      persona.nombre,
      persona.apellidos,
      persona.campamento?.nombre ?? "",
      persona.cargo?.nombre ?? "",
      persona.estado_persona?.nombre ?? "",
      persona.codigo_campamento ?? "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => escapeCsv(String(value))).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "personas.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", background: "#0f172a", minHeight: "100vh" }}>
      <div style={{ flex: 1 }}>
        <Navbar />

        <main className="campamentos-page">
          <section className="campamentos-header">
            <div>
              <span className="page-badge">Modulo personas</span>
              <h1>Personas</h1>
              <p className="page-description">
                Administra personas por secciones para consultar, crear y editar
                sin saturar la pantalla.
              </p>
            </div>

            <div className="campamentos-stat">
              <span className="stat-label">Activas</span>
              <strong className="stat-value">{personas.length}</strong>
            </div>
          </section>

          {error && <div className="error-box">{error}</div>}

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
              marginBottom: "24px",
            }}
          >
            <button
              type="button"
              style={tabButtonStyle("lista")}
              onClick={() => {
                setPersonaEditando(null);
                setActiveTab("lista");
              }}
            >
              Lista de personas
            </button>

            <button
              type="button"
              style={tabButtonStyle("formulario")}
              onClick={() => {
                setPersonaEditando(null);
                setActiveTab("formulario");
              }}
            >
              Crear persona
            </button>

            <button
              type="button"
              style={tabButtonStyle("cargos")}
              onClick={() => {
                setPersonaEditando(null);
                setActiveTab("cargos");
              }}
            >
              Cargos
            </button>

            <button
              type="button"
              style={tabButtonStyle("estados")}
              onClick={() => {
                setPersonaEditando(null);
                setActiveTab("estados");
              }}
            >
              Estados
            </button>
          </section>

          {activeTab === "lista" && (
            <section className="campamentos-list-card">
              <div className="card-header">
                <div>
                  <h3>Listado</h3>
                  <p className="small-text">
                    Visualiza {personas.length} personas segun los filtros.
                  </p>
                </div>

                <button
                  type="button"
                  className="button button-secondary"
                  onClick={exportCsv}
                  disabled={personas.length === 0}
                >
                  Exportar CSV
                </button>
              </div>

              <div className="campamentos-filter-card">
                <div className="campamentos-filter-row">
                  <label className="filter-field">
                    <span>Buscar</span>
                    <input
                      value={filters.buscar}
                      placeholder="Nombre, cedula, codigo, cargo..."
                      onChange={(event) =>
                        handleFilterChange("buscar", event.target.value)
                      }
                    />
                  </label>

                  <label className="filter-field">
                    <span>Campamento</span>
                    <select
                      value={filters.id_campamento}
                      onChange={(event) =>
                        handleFilterChange("id_campamento", event.target.value)
                      }
                    >
                      <option value="">Todos</option>
                      {campamentos.map((campamento) => (
                        <option
                          key={campamento.id_campamento}
                          value={campamento.id_campamento}
                        >
                          {campamento.nombre}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="filter-field">
                    <span>Cargo</span>
                    <select
                      value={filters.id_cargo}
                      onChange={(event) =>
                        handleFilterChange("id_cargo", event.target.value)
                      }
                    >
                      <option value="">Todos</option>
                      {cargos.map((cargo) => (
                        <option key={cargo.id_cargo} value={cargo.id_cargo}>
                          {cargo.nombre}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="filter-field">
                    <span>Estado</span>
                    <select
                      value={filters.id_estado}
                      onChange={(event) =>
                        handleFilterChange("id_estado", event.target.value)
                      }
                    >
                      <option value="">Todos</option>
                      {estados.map((estado) => (
                        <option key={estado.id_estado} value={estado.id_estado}>
                          {estado.nombre}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => {
                      setCurrentPage(1);
                      setFilters(emptyFilters);
                    }}
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              <PersonaTabla
                personas={personasPagina}
                loading={loading}
                deletingId={isDeletingId}
                onView={(persona) => void handleView(persona)}
                onEdit={handleEdit}
                onDelete={(persona) => void handleDelete(persona)}
              />

              {!loading && personas.length > pageSize && (
                <div className="personas-pagination">
                  <button
                    type="button"
                    className="button button-secondary"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                  >
                    Anterior
                  </button>

                  <span>
                    Pagina {currentPage} de {totalPages}
                  </span>

                  <button
                    type="button"
                    className="button button-secondary"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </section>
          )}

          {activeTab === "formulario" && (
            <section className="campamentos-form-card">
              <PersonaForm
                campamentos={campamentos}
                personaEditando={personaEditando}
                onCancelEdit={() => {
                  setPersonaEditando(null);
                  setActiveTab("lista");
                }}
                onSuccess={() => {
                  setPersonaEditando(null);
                  setActiveTab("lista");
                  void loadData();
                }}
              />
            </section>
          )}

          {activeTab === "cargos" && (
            <CargosManager
              onChanged={() => {
                void loadData(filters);
              }}
            />
          )}

          {activeTab === "estados" && (
            <EstadosManager
              onChanged={() => {
                void loadData(filters);
              }}
            />
          )}
        </main>
      </div>

      <PersonaDetalle
        persona={personaDetalle}
        onClose={() => setPersonaDetalle(null)}
      />
    </div>
  );
}

export default PersonasPage;
