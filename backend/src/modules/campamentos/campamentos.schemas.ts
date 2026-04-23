import { CreateCampamentoDTO, UpdateCampamentoDTO } from "./campamentos.dto";

export const validateCreateCampamento = (data: CreateCampamentoDTO) => {
  const nombre = data.nombre?.trim();
  const ubicacion = data.ubicacion?.trim();
  const descripcion = data.descripcion?.trim();

  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }

  if (nombre.length < 3) {
    throw new Error("El nombre debe tener al menos 3 caracteres");
  }

  if (ubicacion && ubicacion.length < 3) {
    throw new Error("La ubicacion debe tener al menos 3 caracteres");
  }

  if (descripcion && descripcion.length > 255) {
    throw new Error("La descripcion no puede exceder los 255 caracteres");
  }
};

export const validateUpdateCampamento = (data: UpdateCampamentoDTO) => {
  if (data.nombre !== undefined) {
    const nombre = data.nombre.trim();

    if (nombre === "") {
      throw new Error("El nombre no puede estar vacio");
    }

    if (nombre.length < 3) {
      throw new Error("El nombre debe tener al menos 3 caracteres");
    }
  }

  if (data.ubicacion !== undefined) {
    const ubicacion = data.ubicacion.trim();

    if (ubicacion && ubicacion.length < 3) {
      throw new Error("La ubicacion debe tener al menos 3 caracteres");
    }
  }

  const descripcion = data.descripcion?.trim();

  if (descripcion && descripcion.length > 255) {
    throw new Error("La descripcion no puede exceder los 255 caracteres");
  }
};
