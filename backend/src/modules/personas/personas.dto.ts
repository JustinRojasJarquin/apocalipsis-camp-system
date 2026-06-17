export interface CreatePersonaDTO {
  id_campamento: number;
  cedula: string;
  nombre: string;
  apellidos: string;
  fecha_nacimiento?: string | null;
  foto_url?: string | null;
  imagen_carnet_url?: string | null;
  codigo_campamento?: string | null;
  id_cargo_actual?: number | null;
  id_estado_actual?: number | null;
}

export interface UpdatePersonaDTO {
  id_campamento?: number;
  cedula?: string;
  nombre?: string;
  apellidos?: string;
  fecha_nacimiento?: string | null;
  foto_url?: string | null;
  imagen_carnet_url?: string | null;
  codigo_campamento?: string | null;
  id_cargo_actual?: number | null;
  id_estado_actual?: number | null;
  activo?: boolean;
}

export interface PersonaResponseDTO {
  id_persona: number;
  id_campamento: number;
  cedula: string;
  nombre: string;
  apellidos: string;
  fecha_nacimiento: Date | null;
  foto_url: string | null;
  imagen_carnet_url: string | null;
  codigo_campamento: string | null;
  id_cargo_actual: number | null;
  id_estado_actual: number | null;
  activo: boolean;
  campamento?: {
    id_campamento: number;
    nombre: string;
  };
  cargo?: {
    id_cargo: number;
    nombre: string;
  } | null;
  estado_persona?: {
    id_estado: number;
    nombre: string;
  } | null;
}

export interface PersonaFiltersDTO {
  buscar?: string;
  id_campamento?: number;
  id_cargo?: number;
  id_estado?: number;
  activo?: boolean;
}
