import { useState } from "react";
import type { FormEvent } from "react";
import type { CrearExploracionForm } from "../types";
import { crearExploracion } from "../exploraciones.api";

interface Props {
  idCampamento: number;
  onCreada: () => void;
  onCancelar: () => void;
}

function ExploracionForm({ idCampamento, onCreada, onCancelar }: Props) {
  const [form, setForm] = useState<CrearExploracionForm>({
    id_campamento: idCampamento,
    nombre: "",
    descripcion: "",
    fecha_inicio_plan: "",
    dias_estimados: 1,
    dias_extra: 0,
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "dias_estimados" || name === "dias_extra"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }
    if (!form.fecha_inicio_plan) {
      setError("La fecha de inicio es requerida");
      return;
    }
    if (form.dias_estimados < 1) {
      setError("Los días estimados deben ser al menos 1");
      return;
    }

    try {
      setCargando(true);
      await crearExploracion(form);
      onCreada();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear la exploración");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <p className="section-description">
        Define el objetivo, la fecha de salida y la duración estimada. Después
        podrás asignar personas y recursos desde el listado.
      </p>

      <div className="modal-form__section">
        <h3 className="modal-form__section-title">Datos de la misión</h3>

        <label className="form-field" htmlFor="nombre">
          <span>Nombre de la misión *</span>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Reconocimiento norte"
            maxLength={100}
            autoFocus
          />
        </label>

        <label className="form-field" htmlFor="descripcion">
          <span>Descripción</span>
          <textarea
            id="descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Objetivo, zona a explorar, riesgos conocidos..."
            rows={3}
          />
        </label>
      </div>

      <div className="modal-form__section">
        <h3 className="modal-form__section-title">Planificación</h3>

        <label className="form-field" htmlFor="fecha_inicio_plan">
          <span>Fecha de inicio planificada *</span>
          <input
            id="fecha_inicio_plan"
            name="fecha_inicio_plan"
            type="date"
            value={form.fecha_inicio_plan}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
          />
        </label>

        <div className="modal-form__row">
          <label className="form-field" htmlFor="dias_estimados">
            <span>Días estimados *</span>
            <input
              id="dias_estimados"
              name="dias_estimados"
              type="number"
              value={form.dias_estimados}
              onChange={handleChange}
              min={1}
              max={365}
            />
          </label>

          <label className="form-field" htmlFor="dias_extra">
            <span>Días extra (margen)</span>
            <input
              id="dias_extra"
              name="dias_extra"
              type="number"
              value={form.dias_extra}
              onChange={handleChange}
              min={0}
              max={30}
            />
          </label>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="modal-form__actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={onCancelar}
        >
          Cancelar
        </button>
        <button type="submit" className="button button-primary" disabled={cargando}>
          {cargando ? "Creando..." : "Crear exploración"}
        </button>
      </div>
    </form>
  );
}

export default ExploracionForm;
