import { httpClient } from '../../lib/http/httpClient';
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from './types';

/** Llamadas al módulo de autenticación del backend (`/auth`). */
export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await httpClient.post<AuthResponse>(
      '/auth/register',
      payload,
    );
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await httpClient.post<AuthResponse>(
      '/auth/login',
      payload,
    );
    return data;
  },

  async getProfile(): Promise<AuthUser> {
    const { data } = await httpClient.get<AuthUser>('/auth/profile');
    return data;
  },
};
