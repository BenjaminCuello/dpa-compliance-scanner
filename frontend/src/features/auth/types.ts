/** Datos públicos del usuario autenticado, según `AuthenticatedUserDto`. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/** Respuesta de login/registro, según `AuthResponseDto`. */
export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

/** Payload de `POST /auth/login`, según `LoginDto`. */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Payload de `POST /auth/register`, según `RegisterDto`. */
export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
}
