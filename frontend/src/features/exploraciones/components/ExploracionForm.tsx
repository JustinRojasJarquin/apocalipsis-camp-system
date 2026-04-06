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
    } catch (e: any) {
      setError(e.message || "Error al crear la exploración");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Nueva Exploración</h2>
      <form onSubmit={handleSubmit} className="exploracion-form">
        <div className="campo">
          <label htmlFor="nombre">Nombre de la misión *</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Reconocimiento norte"
            maxLength={100}
          />
        </div>

        <div className="campo">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Objetivo de la exploración..."
            rows={3}
          />
        </div>

        <div className="campo">
          <label htmlFor="fecha_inicio_plan">Fecha de inicio planificada *</label>
          <input
            id="fecha_inicio_plan"
            name="fecha_inicio_plan"
            type="date"
            value={form.fecha_inicio_plan}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="campos-fila">
          <div className="campo">
            <label htmlFor="dias_estimados">Días estimados *</label>
            <input
              id="dias_estimados"
              name="dias_estimados"
              type="number"
              value={form.dias_estimados}
              onChange={handleChange}
              min={1}
              max={365}
            />
          </div>

          <div className="campo">
            <label htmlFor="dias_extra">Días extra (margen)</label>
            <input
              id="dias_extra"
              name="dias_extra"
              type="number"
              value={form.dias_extra}
              onChange={handleChange}
              min={0}
              max={30}
            />
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="form-acciones">
          <button type="button" className="btn-secundario" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="submit" className="btn-primario" disabled={cargando}>
            {cargando ? "Creando..." : "Crear exploración"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ExploracionForm;
