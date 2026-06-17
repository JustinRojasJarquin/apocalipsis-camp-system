import type { recurso_categoria } from "../../generated/prisma/enums";

export interface CreateRecursoDTO {
  nombre: string;
  categoria: recurso_categoria;
  unidad: string;
}

export interface UpdateRecursoDTO {
  nombre?: string;
  categoria?: recurso_categoria;
  unidad?: string;
}
