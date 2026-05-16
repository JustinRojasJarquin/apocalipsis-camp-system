import type { CreateCargoDTO, UpdateCargoDTO } from "./cargos.dto";

const validateNombre = (nombre: string | undefined, required: boolean) => {
  if (nombre === undefined) {
    if (required) {
      throw new Error("El nombre del cargo es obligatorio");
    }

    return;
  }

  const trimmed = nombre.trim();

  if (!trimmed) {
    throw new Error("El nombre del cargo no puede estar vacio");
  }

  if (trimmed.length < 3) {
    throw new Error("El nombre del cargo debe tener al menos 3 caracteres");
  }

  if (trimmed.length > 100) {
    throw new Error("El nombre del cargo no puede exceder 100 caracteres");
  }
};

const validateDescripcion = (descripcion: string | null | undefined) => {
  if (descripcion === undefined || descripcion === null) {
    return;
  }

  if (descripcion.trim().length > 500) {
    throw new Error("La descripcion no puede exceder 500 caracteres");
  }
};

export const validateCreateCargo = (data: CreateCargoDTO) => {
  validateNombre(data.nombre, true);
  validateDescripcion(data.descripcion);
};

export const validateUpdateCargo = (data: UpdateCargoDTO) => {
  if (Object.keys(data).length === 0) {
    throw new Error("Debes enviar al menos un campo para actualizar");
  }

  validateNombre(data.nombre, false);
  validateDescripcion(data.descripcion);
};
