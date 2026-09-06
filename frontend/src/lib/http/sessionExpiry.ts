import type { AxiosError } from 'axios';

/** Endpoints donde un 401 significa "credenciales inválidas", no sesión expirada. */
const CREDENTIAL_CHECK_PATHS = ['/auth/login', '/auth/register'];

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
