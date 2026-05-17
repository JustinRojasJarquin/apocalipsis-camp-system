export interface CreateInventarioCampamentoDTO {
  campId: number;
  resourceId: number;
  quantity: number;
  minThreshold: number;
}

export interface UpdateInventarioCampamentoDTO {
  quantity: number;
  minThreshold: number;
}

export interface CreateProduccionDiariaDTO {
  fecha?: string; // ISO date optional, defaults to today
  personaId: number;
  campId: number;
  resourceId: number;
  cantidad: number;
  ajusteRazon?: string | null;
  observaciones?: string | null;
}

export interface CreateRacionDiariaDTO {
  fecha?: string; // ISO date optional, defaults to today
  personaId: number;
  campId: number;
  resourceId: number;
  cantidad: number;
}
