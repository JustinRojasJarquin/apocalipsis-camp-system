export interface Campamento {
  id_campamento?: number;
  nombre: string;
  ubicacion?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CampamentoFormData {
  nombre: string;
  ubicacion: string;
  descripcion: string;
}
