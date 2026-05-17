// Validaciones para el módulo de inventario
// Nota: Los modelos de BD se manejan con Prisma, no con esquemas aquí.

export const validateResource = (data: any): string | null => {
  if (
    data.campId == null ||
    data.resourceId == null ||
    data.quantity == null ||
    data.minThreshold == null
  ) {
    return "Todos los campos son requeridos: campId, resourceId, quantity, minThreshold";
  }

  if (typeof data.campId !== "number" || data.campId <= 0) {
    return "campId debe ser un número válido";
  }

  if (typeof data.resourceId !== "number" || data.resourceId <= 0) {
    return "resourceId debe ser un número válido";
  }

  if (typeof data.quantity !== "number" || data.quantity < 0) {
    return "Quantity debe ser un número positivo";
  }

  if (typeof data.minThreshold !== "number" || data.minThreshold < 0) {
    return "minThreshold debe ser un número positivo";
  }

  return null;
};

export const validateProduccion = (data: any): string | null => {
  if (data.personaId == null || data.campId == null || data.resourceId == null || data.cantidad == null) {
    return "Campos requeridos: personaId, campId, resourceId, cantidad";
  }

  if (typeof data.personaId !== "number" || data.personaId <= 0) return "personaId inválido";
  if (typeof data.campId !== "number" || data.campId <= 0) return "campId inválido";
  if (typeof data.resourceId !== "number" || data.resourceId <= 0) return "resourceId inválido";
  if (typeof data.cantidad !== "number" || data.cantidad <= 0) return "cantidad debe ser mayor que 0";

  return null;
};

export const validateRacion = validateProduccion;