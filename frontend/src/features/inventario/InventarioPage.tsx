import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Navbar from "../../shared/components/Navbar";
import { mapInventoryError } from "../../shared/utils/errorMapper";
import {
  createResource,
  createRacion,
  createProduccion,
  deleteResource,
  getAvailableResources,
  getInventoryMovements,
  getResources,
  recalculateInventory,
  updateResource,
} from "./inventario.api";
import { getCampamentos } from "../campamentos/campamentos.api";
import { getPersonas } from "../personas/personas.api";
import type {
  InventarioFormData,
  InventarioResource,
  MovimientoRegistro,
  PersonaOption,
  ProduccionFormData,
  RacionFormData,
  RecursoOption,
} from "./types";

interface CampamentoOption {
  id_campamento: number;
  nombre: string;
}

const emptyForm: InventarioFormData = {
  campId: 0,
  resourceId: 0,
  quantity: 0,
  minThreshold: 0,
};

function InventarioPage() {
  const [resources, setResources] = useState<InventarioResource[]>([]);
  const [campamentos, setCampamentos] = useState<CampamentoOption[]>([]);
  const [availableResources, setAvailableResources] = useState<RecursoOption[]>([]);
  const [personas, setPersonas] = useState<PersonaOption[]>([]);
  const [movements, setMovements] = useState<MovimientoRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<InventarioFormData>(emptyForm);
  const [productionForm, setProductionForm] = useState<ProduccionFormData>({
    fecha: new Date().toISOString().split("T")[0],
    personaId: 0,
    campId: 0,
    resourceId: 0,
    cantidad: 0,
    ajusteRazon: "",
    observaciones: "",
  });
  const [rationForm, setRationForm] = useState<RacionFormData>({
    fecha: new Date().toISOString().split("T")[0],
    personaId: 0,
    campId: 0,
    resourceId: 0,
    cantidad: 0,
  });
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isProducing, setIsProducing] = useState(false);
  const [isRationing, setIsRationing] = useState(false);
  const [campamentoFilter, setCampamentoFilter] = useState<number | undefined>(undefined);
  const [recalculateDate, setRecalculateDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const loadResources = async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setShowErrorDetails(false);
    setErrorSummary(null);

    try {
      const data = await getResources(campamentoFilter);
      setResources(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        // @ts-ignore
        const body = err.body ?? null;
        setErrorDetails(body);
        setErrorSummary(formatErrorSummary(body));
      } else {
        setError("Error cargando inventario.");
        setErrorDetails(null);
        setErrorSummary(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatErrorSummary = (body: any): string | null => {
    const mapped = mapInventoryError(body);
    if (mapped) return mapped;
    if (!body) return null;
    if (typeof body === "string") return body;
    if (typeof body === "object") {
      if (body.message) return String(body.message);
      if (body.mensaje) return String(body.mensaje);
      if (body.error) return String(body.error);
      if (Array.isArray(body.errors) && body.errors.length) {
        return body.errors.map((e: any) => (e.message || e.mensaje || String(e))).join(", ");
      }
      const keys = Object.keys(body);
      if (keys.length === 1 && typeof body[keys[0]] === "string") {
        return `${keys[0]}: ${body[keys[0]]}`;
      }
      return keys.slice(0, 3).map(k => `${k}: ${JSON.stringify(body[k])}`).join(" | ");
    }
    return String(body);
  };

  const loadCampamentos = async () => {
    try {
      const data = await getCampamentos();
      setCampamentos(data);
    } catch (err) {
      console.error("Error cargando campamentos:", err);
      // fallback silencioso si no está disponible.
    }
  };

  const loadAvailableResources = async () => {
    try {
      const data = await getAvailableResources();
      setAvailableResources(data);
    } catch {
      // fallback silencioso si no está disponible.
    }
  };

  const loadPersonas = async () => {
    try {
      const data = await getPersonas();
      setPersonas(data);
    } catch {
      // fallback silencioso si no está disponible.
    }
  };

  const loadMovements = async (campId?: number) => {
    try {
      const data = await getInventoryMovements(campId);
      setMovements(data);
    } catch {
      // fallback para no bloquear la vista.
    }
  };

  useEffect(() => {
    void loadCampamentos();
    void loadAvailableResources();
    void loadPersonas();
  }, []);

  useEffect(() => {
    void loadResources();
    void loadMovements(campamentoFilter);
  }, [campamentoFilter]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingKey(null);
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: Number(value),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (editingKey) {
        const [campId, resourceId] = editingKey.split("-").map(Number);
        await updateResource(campId, resourceId, {
          quantity: form.quantity,
          minThreshold: form.minThreshold,
        });
      } else {
        await createResource(form);
      }
      resetForm();
      await loadResources();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        // @ts-ignore
        const body = err.body ?? null;
        setErrorDetails(body);
        setErrorSummary(formatErrorSummary(body));
      } else {
        setError("No se pudo guardar el recurso de inventario.");
        setErrorDetails(null);
        setErrorSummary(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (resource: InventarioResource) => {
    setForm({
      campId: resource.campId,
      resourceId: resource.id,
      quantity: resource.quantity,
      minThreshold: resource.minThreshold,
    });
    setEditingKey(`${resource.campId}-${resource.id}`);
  };

  const handleDelete = async (resource: InventarioResource) => {
    const confirmed = window.confirm(
      `Eliminar el recurso ${resource.name} del campamento ${resource.campamentoNombre}?`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await deleteResource(resource.campId, resource.id);
      await loadResources();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        // @ts-ignore
        const body = err.body ?? null;
        setErrorDetails(body);
        setErrorSummary(formatErrorSummary(body));
      } else {
        setError("No se pudo eliminar el recurso de inventario.");
        setErrorDetails(null);
        setErrorSummary(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProductionChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    const numericFields = ["cantidad", "campId", "resourceId", "personaId"];
    const key = name as keyof ProduccionFormData;
    setProductionForm((current) => ({
      ...current,
      [key]: numericFields.includes(name) ? Number(value) : value,
    } as ProduccionFormData));
  };

  const handleRationChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    const numericFields = ["cantidad", "campId", "resourceId", "personaId"];
    const key = name as keyof RacionFormData;
    setRationForm((current) => ({
      ...current,
      [key]: numericFields.includes(name) ? Number(value) : value,
    } as RacionFormData));
  };

  const handleProductionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsProducing(true);
    setError(null);
    setMessage(null);

    try {
      await createProduccion(productionForm);
      setMessage("Producción registrada correctamente.");
      setProductionForm((current) => ({
        ...current,
        cantidad: 0,
        ajusteRazon: "",
        observaciones: "",
      }));
      await loadResources();
      await loadMovements(productionForm.campId || campamentoFilter);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        // @ts-ignore
        const body = err.body ?? null;
        setErrorDetails(body);
        setErrorSummary(formatErrorSummary(body));
      } else {
        setError("No se pudo registrar la producción.");
        setErrorDetails(null);
        setErrorSummary(null);
      }
    } finally {
      setIsProducing(false);
    }
  };

  const handleRationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsRationing(true);
    setError(null);
    setMessage(null);

    try {
      await createRacion(rationForm);
      setMessage("Ración registrada correctamente.");
      setRationForm((current) => ({
        ...current,
        cantidad: 0,
      }));
      await loadResources();
      await loadMovements(rationForm.campId || campamentoFilter);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        // @ts-ignore
        const body = err.body ?? null;
        setErrorDetails(body);
        setErrorSummary(formatErrorSummary(body));
      } else {
        setError("No se pudo registrar la ración.");
        setErrorDetails(null);
        setErrorSummary(null);
      }
    } finally {
      setIsRationing(false);
    }
  };

  const handleRecalculate = async () => {
    if (!campamentoFilter) {
      setError("Selecciona un campamento para actualizar el inventario.");
      return;
    }

    setError(null);
    setMessage(null);

    try {
      await recalculateInventory(campamentoFilter, recalculateDate);
      setMessage("Inventario actualizado correctamente.");
      await loadResources();
      await loadMovements(campamentoFilter);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        // @ts-ignore
        const body = err.body ?? null;
        setErrorDetails(body);
        setErrorSummary(formatErrorSummary(body));
      } else {
        setError("No se pudo recalcular el inventario.");
        setErrorDetails(null);
        setErrorSummary(null);
      }
    }
  };

  return (
    <div style={{ display: "flex", background: "#0f172a", minHeight: "100vh" }}>
      
      <div style={{ flex: 1 }}>
        <Navbar />

        <main className="campamentos-page">
          <section className="campamentos-header">
            <div>
              <span className="page-badge">Modulo inventario</span>
              <h1>Inventario de campamentos</h1>
              <p className="page-description">
                Administra el inventario por campamento. Solo el inventario de
                campamentos está activo en este módulo.
              </p>
            </div>

            <div className="campamentos-stat">
              <span className="stat-label">Registros</span>
              <strong className="stat-value">{resources.length}</strong>
            </div>
          </section>

          {error && (
            <div className="error-box">
              <div>{error}</div>
              {errorSummary && (
                <div style={{ marginTop: 6, fontStyle: "italic" }}>{errorSummary}</div>
              )}
              {errorDetails && (
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setShowErrorDetails((s) => !s)}
                  >
                    {showErrorDetails ? "Ocultar detalles" : "Mostrar detalles"}
                  </button>
                  {showErrorDetails && (
                    <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                      {JSON.stringify(errorDetails, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          <section className="campamentos-grid">
            <div className="campamentos-list-card" style={{ minHeight: 320 }}>
              <div className="card-header" style={{ gap: 12 }}>
                <div>
                  <h3>Recursos</h3>
                  <p className="small-text">
                    Listado de recursos disponibles por campamento.
                  </p>
                </div>

                <label className="form-field" style={{ margin: 0 }}>
                  <span>Filtro campamento</span>
                  <select
                    value={campamentoFilter ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setCampamentoFilter(value ? Number(value) : undefined);
                    }}
                  >
                    <option value="">Todos</option>
                    {campamentos.map((camp) => (
                      <option key={camp.id_campamento} value={camp.id_campamento}>
                        {camp.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {loading ? (
                <div className="empty-state">Cargando recursos...</div>
              ) : resources.length === 0 ? (
                <div className="empty-state">
                  No hay registros de inventario disponibles.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Recurso</th>
                        <th>Campamento</th>
                        <th>Cantidad</th>
                        <th>Umbral</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resources.map((resource) => (
                        <tr key={`${resource.campId}-${resource.id}`}>
                          <td>{resource.name}</td>
                          <td>{resource.campamentoNombre || resource.campId}</td>
                          <td>{resource.quantity}</td>
                          <td>{resource.minThreshold}</td>
                          <td>{resource.status}</td>
                          <td>
                            <button
                              type="button"
                              className="button button-secondary"
                              onClick={() => handleEdit(resource)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="button button-danger"
                              onClick={() => void handleDelete(resource)}
                              style={{ marginLeft: 8 }}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <aside className="campamentos-form-card">
              <form className="campamentos-form" onSubmit={handleSubmit}>
                <div className="form-section-header">
                  <h3>{editingKey ? "Editar recurso" : "Agregar recurso"}</h3>
                  <p className="section-description">
                    {editingKey
                      ? "Actualiza la cantidad o el umbral del inventario."
                      : "Registra un nuevo recurso en un campamento."}
                  </p>
                </div>

                <label className="form-field">
                  <span>Campamento</span>
                  <select
                    name="campId"
                    value={form.campId}
                    onChange={handleChange}
                    required
                    disabled={Boolean(editingKey)}
                  >
                    <option value={0}>Selecciona un campamento</option>
                    {campamentos.map((camp) => (
                      <option key={camp.id_campamento} value={camp.id_campamento}>
                        {camp.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Recurso</span>
                  <select
                    name="resourceId"
                    value={form.resourceId}
                    onChange={handleChange}
                    required
                    disabled={Boolean(editingKey)}
                  >
                    <option value={0}>Selecciona un recurso</option>
                    {availableResources.map((resource) => (
                      <option key={resource.id_recurso} value={resource.id_recurso}>
                        {resource.nombre}
                      </option>
                    ))}
                  </select>
                  <small>
                    Selecciona el recurso existente. Solo se edita cantidad y umbral.
                  </small>
                </label>

                <label className="form-field">
                  <span>Cantidad</span>
                  <input
                    name="quantity"
                    type="number"
                    min={0}
                    value={form.quantity}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Umbral mínimo</span>
                  <input
                    name="minThreshold"
                    type="number"
                    min={0}
                    value={form.minThreshold}
                    onChange={handleChange}
                    required
                  />
                </label>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="button button-primary" disabled={isSaving}>
                    {isSaving ? "Guardando..." : editingKey ? "Actualizar" : "Crear"}
                  </button>

                  {editingKey && (
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={resetForm}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </aside>
          </section>

          {message && <div className="success-box">{message}</div>}

          <section className="campamentos-grid">
            <aside className="campamentos-form-card">
              <form className="campamentos-form" onSubmit={handleProductionSubmit}>
                <div className="form-section-header">
                  <h3>Producción diaria</h3>
                  <p className="section-description">
                    Registra la producción por persona y actualiza el inventario.
                  </p>
                </div>

                <label className="form-field">
                  <span>Campamento</span>
                  <select
                    name="campId"
                    value={productionForm.campId}
                    onChange={handleProductionChange}
                    required
                  >
                    <option value={0}>Selecciona un campamento</option>
                    {campamentos.map((camp) => (
                      <option key={camp.id_campamento} value={camp.id_campamento}>
                        {camp.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Persona</span>
                  <select
                    name="personaId"
                    value={productionForm.personaId}
                    onChange={handleProductionChange}
                    required
                  >
                    <option value={0}>Selecciona una persona</option>
                    {personas.map((persona) => (
                      <option key={persona.id_persona} value={persona.id_persona}>
                        {persona.nombre} {persona.apellidos}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Recurso</span>
                  <select
                    name="resourceId"
                    value={productionForm.resourceId}
                    onChange={handleProductionChange}
                    required
                  >
                    <option value={0}>Selecciona un recurso</option>
                    {availableResources.map((resource) => (
                      <option key={resource.id_recurso} value={resource.id_recurso}>
                        {resource.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Fecha</span>
                  <input
                    name="fecha"
                    type="date"
                    value={productionForm.fecha}
                    onChange={handleProductionChange}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Cantidad</span>
                  <input
                    name="cantidad"
                    type="number"
                    min={0}
                    value={productionForm.cantidad}
                    onChange={handleProductionChange}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Motivo / Ajuste</span>
                  <input
                    name="ajusteRazon"
                    type="text"
                    value={productionForm.ajusteRazon}
                    onChange={handleProductionChange}
                  />
                </label>

                <label className="form-field">
                  <span>Observaciones</span>
                  <textarea
                    name="observaciones"
                    value={productionForm.observaciones}
                    onChange={handleProductionChange}
                  />
                </label>

                <button className="button button-primary" disabled={isProducing}>
                  {isProducing ? "Registrando..." : "Registrar producción"}
                </button>
              </form>
            </aside>

            <aside className="campamentos-form-card">
              <form className="campamentos-form" onSubmit={handleRationSubmit}>
                <div className="form-section-header">
                  <h3>Ración diaria</h3>
                  <p className="section-description">
                    Registra el consumo diario y ajusta el inventario automáticamente.
                  </p>
                </div>

                <label className="form-field">
                  <span>Campamento</span>
                  <select
                    name="campId"
                    value={rationForm.campId}
                    onChange={handleRationChange}
                    required
                  >
                    <option value={0}>Selecciona un campamento</option>
                    {campamentos.map((camp) => (
                      <option key={camp.id_campamento} value={camp.id_campamento}>
                        {camp.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Persona</span>
                  <select
                    name="personaId"
                    value={rationForm.personaId}
                    onChange={handleRationChange}
                    required
                  >
                    <option value={0}>Selecciona una persona</option>
                    {personas.map((persona) => (
                      <option key={persona.id_persona} value={persona.id_persona}>
                        {persona.nombre} {persona.apellidos}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Recurso</span>
                  <select
                    name="resourceId"
                    value={rationForm.resourceId}
                    onChange={handleRationChange}
                    required
                  >
                    <option value={0}>Selecciona un recurso</option>
                    {availableResources.map((resource) => (
                      <option key={resource.id_recurso} value={resource.id_recurso}>
                        {resource.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Fecha</span>
                  <input
                    name="fecha"
                    type="date"
                    value={rationForm.fecha}
                    onChange={handleRationChange}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Cantidad</span>
                  <input
                    name="cantidad"
                    type="number"
                    min={0}
                    value={rationForm.cantidad}
                    onChange={handleRationChange}
                    required
                  />
                </label>

                <button className="button button-primary" disabled={isRationing}>
                  {isRationing ? "Registrando..." : "Registrar ración"}
                </button>
              </form>
            </aside>

            <div className="campamentos-list-card" style={{ minHeight: 320 }}>
              <div className="card-header" style={{ gap: 12 }}>
                <div>
                  <h3>Historial de movimientos</h3>
                  <p className="small-text">
                    Registros automáticos de producción y consumo diario.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <label className="form-field" style={{ margin: 0 }}>
                    <span>Fecha de cálculo</span>
                    <input
                      type="date"
                      value={recalculateDate}
                      onChange={(event) => setRecalculateDate(event.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={handleRecalculate}
                    disabled={!campamentoFilter}
                  >
                    Actualizar inventario
                  </button>
                </div>
              </div>

              {movements.length === 0 ? (
                <div className="empty-state">
                  No hay movimientos registrados para el filtro seleccionado.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Campamento</th>
                        <th>Recurso</th>
                        <th>Cantidad</th>
                        <th>Usuario</th>
                        <th>Persona</th>
                        <th>Origen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map((movement) => (
                        <tr key={movement.id_movimiento}>
                          <td>{new Date(movement.fecha_hora).toLocaleString()}</td>
                          <td>{movement.tipo}</td>
                          <td>{movement.campamento}</td>
                          <td>{movement.recurso}</td>
                          <td>{movement.cantidad}</td>
                          <td>{movement.usuario}</td>
                          <td>{movement.persona || "-"}</td>
                          <td>{movement.origen || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default InventarioPage;
