export interface UsuarioAuth {
  id_usuario: number;
  usuario: string;
  id_rol: number;
}

export interface LoginResponse {
  mensaje: string;
  token: string;
  usuario: UsuarioAuth;
}