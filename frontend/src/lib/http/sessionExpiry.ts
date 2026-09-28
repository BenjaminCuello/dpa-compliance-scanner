import type { AxiosError } from 'axios';
import { tokenStorage } from './tokenStorage';

/** Endpoints donde un 401 significa "credenciales inválidas", no sesión expirada. */
const CREDENTIAL_CHECK_PATHS = ['/auth/login', '/auth/register'];

const LOGIN_PATH = '/login';

/** Parámetro con el que `/login` sabe que llega por una sesión expirada. */
export const SESSION_EXPIRED_PARAM = 'sesion';
export const SESSION_EXPIRED_VALUE = 'expirada';
export const SESSION_EXPIRED_LOGIN_URL = `${LOGIN_PATH}?${SESSION_EXPIRED_PARAM}=${SESSION_EXPIRED_VALUE}`;

/**
 * Determina si un error de Axios corresponde a una sesión expirada o un
 * token inválido en un endpoint protegido (y no a un login fallido).
 */
export function isSessionExpired(error: unknown): boolean {
  const axiosError = error as AxiosError;

  if (axiosError?.response?.status !== 401) {
    return false;
  }

  const url = axiosError.config?.url ?? '';
  return !CREDENTIAL_CHECK_PATHS.some((path) => url.includes(path));
}

type RedirectTarget = Pick<Location, 'pathname' | 'assign'>;

/**
 * Ante una sesión expirada, borra el token y lleva a `/login` con el aviso.
 * No redirige si ya se está en `/login`.
 */
export function handleSessionExpired(
  error: unknown,
  location: RedirectTarget = window.location,
): void {
  if (isSessionExpired(error) && location.pathname !== LOGIN_PATH) {
    tokenStorage.clear();
    location.assign(SESSION_EXPIRED_LOGIN_URL);
  }
}
