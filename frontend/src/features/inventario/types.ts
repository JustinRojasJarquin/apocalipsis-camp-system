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

export interface PersonaOption {
  id_persona: number;
  nombre: string;
  apellidos: string;
}

export interface MovimientoRegistro {
  id_movimiento: number;
  campamento: string;
  recurso: string;
  fecha_hora: string;
  tipo: string;
  origen: string | null;
  referencia: number | null;
  cantidad: number;
  usuario: string;
  persona: string | null;
}

export interface InventarioFormData {
  campId: number;
  resourceId: number;
  quantity: number;
  minThreshold: number;
}

export interface ProduccionFormData {
  fecha: string;
  personaId: number;
  campId: number;
  resourceId: number;
  cantidad: number;
  ajusteRazon: string;
  observaciones: string;
}

export interface RacionFormData {
  fecha: string;
  personaId: number;
  campId: number;
  resourceId: number;
  cantidad: number;
}
