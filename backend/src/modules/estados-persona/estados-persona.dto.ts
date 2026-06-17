export interface CreateEstadoPersonaDTO {
  nombre: string;
  descripcion?: string | null;
  disponible?: boolean;
}

export interface UpdateEstadoPersonaDTO {
  nombre?: string;
  descripcion?: string | null;
  disponible?: boolean;
}
