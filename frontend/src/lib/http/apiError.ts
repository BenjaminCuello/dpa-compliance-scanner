interface NestErrorBody {
  message?: string | string[] | NestErrorBody;
}

/**
 * Extrae un mensaje legible desde el formato de error del backend
 * (`{ statusCode, path, timestamp, message }`, con `message` a veces
 * anidado cuando proviene del `ValidationPipe`).
 */
export function extractErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error inesperado. Intenta nuevamente.',
): string {
  const axiosError = error as { response?: { data?: NestErrorBody } };
  let message = axiosError?.response?.data?.message;

  while (message && typeof message === 'object' && !Array.isArray(message)) {
    message = message.message;
  }

  if (Array.isArray(message)) {
    return message[0] ?? fallback;
  }

  return typeof message === 'string' ? message : fallback;
}
