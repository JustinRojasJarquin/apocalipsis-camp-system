export interface CreateCampamentoDTO {
  nombre: string;
  ubicacion?: string;
  descripcion?: string;
}

export interface UpdateCampamentoDTO {
  nombre?: string;
  ubicacion?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CampamentoResponseDTO {
  id_campamento: number;
  nombre: string;
  ubicacion?: string;
  descripcion?: string;
  activo: boolean;
}
