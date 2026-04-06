// ─── Enums ────────────────────────────────────────────────────────────────────

export type ExploracionEstado =
  | "PLANIFICADA"
  | "EN_PROGRESO"
  | "COMPLETADA"
  | "CANCELADA"
  | "FALLIDA";

export type RolEnMision = "LIDER" | "EXPLORADOR";

// ─── Modelos ──────────────────────────────────────────────────────────────────

export interface ExploracionPersona {
  id_exploracion: number;
  id_persona: number;
  rol_en_mision: RolEnMision;
}

export interface RecursoLlevado {
  id_registro: number;
  id_exploracion: number;
  id_recurso: number;
  cantidad_llevada: number;
  // Se completará cuando el módulo de Inventario esté disponible
  nombre_recurso?: string;
}

export interface RecursoEncontrado {
  id_registro: number;
  id_exploracion: number;
  id_recurso: number;
  cantidad_encontrada: number;
  generado_aleatorio: boolean;
  nombre_recurso?: string;
}

export interface Exploracion {
  id_exploracion: number;
  id_campamento: number;
  nombre: string;
  descripcion: string | null;
  fecha_inicio_plan: string;
  dias_estimados: number;
  dias_extra: number;
  dias_extra_usados: number;
  fecha_inicio_real: string | null;
  fecha_fin_real: string | null;
  estado: ExploracionEstado;
  exploracion_persona: ExploracionPersona[];
  exploracion_recurso_llevado: RecursoLlevado[];
  exploracion_recurso_encontrado: RecursoEncontrado[];
}

// ─── Formularios ──────────────────────────────────────────────────────────────

export interface CrearExploracionForm {
  id_campamento: number;
  nombre: string;
  descripcion: string;
  fecha_inicio_plan: string;
  dias_estimados: number;
  dias_extra: number;
}

export interface AsignarPersonaForm {
  id_persona: number;
  rol_en_mision: RolEnMision;
}

export interface RecursoLlevadoForm {
  id_recurso: number;
  cantidad_llevada: number;
}

export interface RecursoEncontradoForm {
  id_recurso: number;
  cantidad_encontrada: number;
}

// ─── Tipos auxiliares ─────────────────────────────────────────────────────────

export interface PersonaResumen {
  id_persona: number;
  nombre: string;
  apellidos: string;
}

export interface RecursoMock {
  id_recurso: number;
  nombre: string;
  categoria: string;
  unidad: string;
}
