export interface LoginDto {
  usuario: string;
  password: string;
}

export interface UsuarioAuthDto {
  id_usuario: number;
  usuario: string;
  id_rol: number;
}

export interface LoginResponseDto {
  mensaje: string;
  token: string;
  usuario: UsuarioAuthDto;
}