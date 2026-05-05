export interface UsuarioAuth {
  id_usuario: number;
  usuario: string;
  id_rol: number;
  rol?: {
    id_rol: number;
    nombre: string;
    codigo: string;
  };
  persona?: {
    id_persona: number;
    nombre: string;
    apellidos: string;
    cargo?: {
      id_cargo: number;
      nombre: string;
    } | null;
    campamento?: {
      id_campamento: number;
      nombre: string;
    } | null;
    estado?: {
      id_estado: number;
      nombre: string;
      disponible: boolean;
    } | null;
  };
}