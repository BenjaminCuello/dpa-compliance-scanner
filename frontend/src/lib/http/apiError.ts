interface NestErrorBody {
  message?: string | string[] | NestErrorBody;
}

/**
 * El límite de peticiones del backend responde con el texto por defecto de
 * `ThrottlerGuard`, en inglés, así que se reemplaza por uno en español.
 */
export const TOO_MANY_REQUESTS_MESSAGE =
  'Demasiadas solicitudes. Espera un minuto e intenta nuevamente.';

/**
 * Extrae un mensaje legible desde el formato de error del backend
 * (`{ statusCode, path, timestamp, message }`, con `message` a veces
 * anidado cuando proviene del `ValidationPipe`).
 */
export function extractErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error inesperado. Intenta nuevamente.',
): string {
  const axiosError = error as {
    response?: { status?: number; data?: NestErrorBody };
  };

  if (axiosError?.response?.status === 429) {
    return TOO_MANY_REQUESTS_MESSAGE;
  }

  let message = axiosError?.response?.data?.message;

  while (message && typeof message === 'object' && !Array.isArray(message)) {
    message = message.message;
  }

  if (Array.isArray(message)) {
    return message[0] ?? fallback;
  }

  return typeof message === 'string' ? message : fallback;
}
