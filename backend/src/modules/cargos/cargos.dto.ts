export interface CreateCargoDTO {
  nombre: string;
  descripcion?: string | null;
}

export interface UpdateCargoDTO {
  nombre?: string;
  descripcion?: string | null;
}
