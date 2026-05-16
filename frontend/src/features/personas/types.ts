export interface PersonaCampamento {
  id_campamento: number;
  nombre: string;
}

export interface PersonaCargo {
  id_cargo: number;
  nombre: string;
  descripcion?: string | null;
}

export interface PersonaEstado {
  id_estado: number;
  nombre: string;
  descripcion?: string | null;
  disponible?: boolean;
}

export interface PersonaCargoHistorial {
  id_asignacion: number;
  id_persona: number;
  id_cargo: number;
  id_campamento: number;
  fecha_inicio: string;
  fecha_fin?: string | null;
  temporal: boolean;
  cargo?: PersonaCargo;
  campamento?: PersonaCampamento;
}

export interface Persona {
  id_persona?: number;
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
  activo?: boolean;
  campamento?: PersonaCampamento;
  cargo?: PersonaCargo | null;
  estado_persona?: PersonaEstado | null;
  asignacion_cargo?: PersonaCargoHistorial[];
}

export interface PersonaFormData {
  id_campamento: string;
  cedula: string;
  nombre: string;
  apellidos: string;
  fecha_nacimiento: string;
  foto_url: string;
  imagen_carnet_url: string;
  codigo_campamento: string;
  id_cargo_actual: string;
  id_estado_actual: string;
}

export interface PersonaFilters {
  buscar: string;
  id_campamento: string;
  id_cargo: string;
  id_estado: string;
}

export interface CargoFormData {
  nombre: string;
  descripcion: string;
}

export interface EstadoPersonaFormData {
  nombre: string;
  descripcion: string;
  disponible: boolean;
}
