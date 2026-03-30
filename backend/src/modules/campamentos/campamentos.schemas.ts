import { CreateCampamentoDTO, UpdateCampamentoDTO } from "./campamentos.dto";

export const validateCreateCampamento = (data: CreateCampamentoDTO) => {
  if (!data.nombre || data.nombre.trim() === "") {
    throw new Error("El nombre es obligatorio");
  }

  if (data.nombre.length < 3) {
    throw new Error("El nombre debe tener al menos 3 caracteres");
  }

  if (data.ubicacion && data.ubicacion.trim().length < 3) {
    throw new Error("La ubicación debe tener al menos 3 caracteres");
  }

  if (data.descripcion && data.descripcion.length > 255) {
    throw new Error("La descripción no puede exceder los 255 caracteres");
  }
};

export const validateUpdateCampamento = (data: UpdateCampamentoDTO) => {
  if (data.nombre !== undefined) {
    if (data.nombre.trim() === "") {
      throw new Error("El nombre no puede estar vacío");
    }

    if (data.nombre.length < 3) {
      throw new Error("El nombre debe tener al menos 3 caracteres");
    }
  }

  if (data.ubicacion !== undefined) {
    if (data.ubicacion.trim() === "") {
      throw new Error("La ubicación no puede estar vacía");
    }

    if (data.ubicacion.length < 3) {
      throw new Error("La ubicación debe tener al menos 3 caracteres");
    }
  }

  if (data.descripcion && data.descripcion.length > 255) {
    throw new Error("La descripción no puede exceder los 255 caracteres");
  }
};
