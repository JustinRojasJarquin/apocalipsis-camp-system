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
