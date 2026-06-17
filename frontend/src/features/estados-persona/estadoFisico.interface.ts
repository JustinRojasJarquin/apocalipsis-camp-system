export interface EstadoFisicoResponse {
  ok: boolean;

  data: {
    riesgo: number;

    explicacionIA: string;
  };
}