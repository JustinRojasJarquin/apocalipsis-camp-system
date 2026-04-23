export interface InventarioResource {
  id: number;
  name: string;
  quantity: number;
  minThreshold: number;
  status: string;
  campId: number;
  campamentoNombre: string;
}

export interface RecursoOption {
  id_recurso: number;
  nombre: string;
}

export interface InventarioFormData {
  campId: number;
  resourceId: number;
  quantity: number;
  minThreshold: number;
}
