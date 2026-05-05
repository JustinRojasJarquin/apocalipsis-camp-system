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