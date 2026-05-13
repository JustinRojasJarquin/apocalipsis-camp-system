import { useEffect, useState } from "react";
import Navbar from "../../../shared/components/Navbar";
import { getCampamentos } from "../../campamentos/campamentos.api";
import PersonaForm from "../components/PersonaForm";
import PersonaTabla from "../components/PersonaTabla";
import { deletePersona, getPersonas } from "../personas.api";
import type { Persona, PersonaCampamento } from "../types";

type PersonasTab = "lista" | "formulario";

function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [campamentos, setCampamentos] = useState<PersonaCampamento[]>([]);
  const [personaEditando, setPersonaEditando] = useState<Persona | null>(null);

  const [activeTab, setActiveTab] = useState<PersonasTab>("lista");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [personasData, campamentosData] = await Promise.all([
        getPersonas(),
        getCampamentos(),
      ]);

      setPersonas(personasData.filter((persona) => persona.activo !== false));

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
          </section>

          {activeTab === "lista" && (
            <section className="campamentos-list-card">
              <div className="card-header">
                <div>
                  <h3>Listado</h3>
                  <p className="small-text">
                    Visualiza las personas registradas y administra sus datos.
                  </p>
                </div>
              </div>

              <PersonaTabla
                personas={personas}
                loading={loading}
                deletingId={isDeletingId}
                onEdit={handleEdit}
                onDelete={(persona) => void handleDelete(persona)}
              />
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
        </main>
      </div>
    </div>
  );
}

export default PersonasPage;