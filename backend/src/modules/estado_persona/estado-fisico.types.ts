export interface CambiarEstadoFisicoDTO {
  idPersona: number;
  idEstadoFisico: number;
  observacion?: string;
  sugeridoPorIA?: boolean;
}