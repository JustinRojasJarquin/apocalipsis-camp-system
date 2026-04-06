// ─── Enums ────────────────────────────────────────────────────────────────────

export type ExploracionEstado =
  | "PLANIFICADA"
  | "EN_PROGRESO"
  | "COMPLETADA"
  | "CANCELADA"
  | "FALLIDA";

export type RolEnMision = "LIDER" | "EXPLORADOR";

// ─── Entrada ──────────────────────────────────────────────────────────────────

export interface CrearExploracionDto {
  id_campamento: number;
  nombre: string;
  descripcion?: string;
  fecha_inicio_plan: string; // ISO date string "YYYY-MM-DD"
  dias_estimados: number;
  dias_extra?: number;
}

export interface ActualizarEstadoDto {
  estado: ExploracionEstado;
  dias_extra_usados?: number;
}

export interface AsignarPersonaDto {
  id_persona: number;
  rol_en_mision?: RolEnMision;
}

export interface AgregarRecursoLlevadoDto {
  id_recurso: number;
  cantidad_llevada: number;
}

export interface RegistrarRecursoEncontradoDto {
  id_recurso: number;
  cantidad_encontrada: number;
  generado_aleatorio?: boolean;
}

// ─── Salida ───────────────────────────────────────────────────────────────────

export interface PersonaEnMisionDto {
  id_persona: number;
  rol_en_mision: RolEnMision;
  // Estos campos los proveerá el módulo de Personas cuando esté listo
  nombre?: string;
  apellidos?: string;
}

export interface RecursoLlevadoDto {
  id_registro: number;
  id_recurso: number;
  cantidad_llevada: number;
  // Este campo lo proveerá Inventario cuando esté listo
  nombre_recurso?: string;
}

export interface RecursoEncontradoDto {
  id_registro: number;
  id_recurso: number;
  cantidad_encontrada: number;
  generado_aleatorio: boolean;
  nombre_recurso?: string;
}

export interface ExploracionDto {
  id_exploracion: number;
  id_campamento: number;
  nombre: string;
  descripcion: string | null;
  fecha_inicio_plan: Date;
  dias_estimados: number;
  dias_extra: number;
  dias_extra_usados: number;
  fecha_inicio_real: Date | null;
  fecha_fin_real: Date | null;
  estado: ExploracionEstado;
  personas: PersonaEnMisionDto[];
  recursos_llevados: RecursoLlevadoDto[];
  recursos_encontrados: RecursoEncontradoDto[];
}
