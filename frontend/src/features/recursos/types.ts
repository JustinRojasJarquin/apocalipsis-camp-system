export interface RecursoItem {
  id_recurso: number;
  nombre: string;
  categoria: string;
  unidad: string;
}

export interface CreateRecursoFormData {
  nombre: string;
  categoria: string;
  unidad: string;
}
