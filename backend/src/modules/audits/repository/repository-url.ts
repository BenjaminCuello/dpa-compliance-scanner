import { InvalidRepositoryUrlError } from './repository.errors';

/** Repositorio remoto validado y normalizado. */
export interface RepositoryReference {
  /** URL canónica, sin `.git` ni barra final. */
  url: string;
  host: string;
  /** Ruta dentro del host, por ejemplo `organizacion/proyecto`. */
  path: string;
}

const SEGMENT = /^[A-Za-z0-9._-]+$/;

/**
 * Valida una URL de repositorio antes de clonarlo.
 * Solo se aceptan repositorios públicos por HTTPS en los hosts permitidos: así
 * no se puede usar el clonado para alcanzar servicios internos ni filtrar
 * credenciales.
 * @param raw URL entregada por el usuario.
 * @param allowedHosts Hosts autorizados, en minúsculas.
 * @throws InvalidRepositoryUrlError si la URL no cumple alguna condición.
 */
export function parseRepositoryUrl(
  raw: string,
  allowedHosts: string[],
): RepositoryReference {
  let parsed: URL;

  try {
    parsed = new URL(raw.trim());
  } catch {
    throw new InvalidRepositoryUrlError('La URL del repositorio no es válida');
  }

  if (parsed.protocol !== 'https:') {
    throw new InvalidRepositoryUrlError('El repositorio debe usar HTTPS');
  }

  if (parsed.username || parsed.password) {
    throw new InvalidRepositoryUrlError(
      'La URL no debe incluir usuario ni contraseña',
    );
  }

  const host = parsed.hostname.toLowerCase();

  if (parsed.port || !allowedHosts.includes(host)) {
    throw new InvalidRepositoryUrlError(
      `Solo se admiten repositorios de: ${allowedHosts.join(', ')}`,
    );
  }

  if (parsed.search || parsed.hash) {
    throw new InvalidRepositoryUrlError(
      'La URL del repositorio no debe incluir parámetros',
    );
  }

  const segments = parsed.pathname
    .replace(/\/+$/, '')
    .replace(/\.git$/i, '')
    .split('/')
    .filter(Boolean);

  if (
    segments.length < 2 ||
    !segments.every(
      (segment) => SEGMENT.test(segment) && !/^\.+$/.test(segment),
    )
  ) {
    throw new InvalidRepositoryUrlError(
      'La URL debe apuntar a un repositorio, por ejemplo https://github.com/organizacion/proyecto',
    );
  }

  const path = segments.join('/');
  return { url: `https://${host}/${path}`, host, path };
}
