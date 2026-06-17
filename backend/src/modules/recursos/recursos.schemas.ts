export const validateRecurso = (data: any): string | null => {
  if (!data.nombre || typeof data.nombre !== "string") {
    return "nombre es requerido y debe ser texto";
  }

  if (!data.categoria || typeof data.categoria !== "string") {
    return "categoria es requerida y debe ser texto";
  }

  if (!data.unidad || typeof data.unidad !== "string") {
    return "unidad es requerida y debe ser texto";
  }

  return null;
};

export const validateUpdateRecurso = (data: any): string | null => {
  if (data.nombre != null && typeof data.nombre !== "string") {
    return "nombre debe ser texto";
  }

  if (data.categoria != null && typeof data.categoria !== "string") {
    return "categoria debe ser texto";
  }

  if (data.unidad != null && typeof data.unidad !== "string") {
    return "unidad debe ser texto";
  }

  return null;
};
