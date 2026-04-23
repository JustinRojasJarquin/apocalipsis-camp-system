import { useEffect, useState } from "react";
import Navbar from "../../../shared/components/Navbar";
import { getCampamentos } from "../../campamentos/campamentos.api";
import PersonaForm from "../components/PersonaForm";
import PersonaTabla from "../components/PersonaTabla";
import { deletePersona, getPersonas } from "../personas.api";
import type { Persona, PersonaCampamento } from "../types";

function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [campamentos, setCampamentos] = useState<PersonaCampamento[]>([]);
  const [personaEditando, setPersonaEditando] = useState<Persona | null>(null);
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
        err instanceof Error ? err.message : "No se pudieron cargar las personas.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleDelete = async (persona: Persona) => {
    if (!persona.id_persona) {
      return;
    }

    const confirmed = window.confirm(
      `Deseas desactivar a "${persona.nombre} ${persona.apellidos}"?`,
    );

    if (!confirmed) {
      return;
    }

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
                Registra, consulta y actualiza las personas activas del sistema,
                enlazandolas directamente con su campamento.
              </p>
            </div>

            <div className="campamentos-stat">
              <span className="stat-label">Activas</span>
              <strong className="stat-value">{personas.length}</strong>
            </div>
          </section>

          {error && <div className="error-box">{error}</div>}

          <section className="campamentos-grid">
            <div className="campamentos-list-card">
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
                onEdit={setPersonaEditando}
                onDelete={(persona) => void handleDelete(persona)}
              />
            </div>

            <aside className="campamentos-form-card">
              <PersonaForm
                campamentos={campamentos}
                personaEditando={personaEditando}
                onCancelEdit={() => setPersonaEditando(null)}
                onSuccess={() => {
                  setPersonaEditando(null);
                  void loadData();
                }}
              />
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}

export default PersonasPage;
