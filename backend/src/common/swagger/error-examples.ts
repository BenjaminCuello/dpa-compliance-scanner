import { ErrorResponseDto } from '../dto/error-response.dto';

/** Respuesta de error que se documenta en un endpoint. */
export interface ErrorResponseSpec {
  status: number;
  description: string;
  /** Cuerpo de ejemplo, igual al que entrega `HttpExceptionFilter`. */
  example: ErrorResponseDto;
}

const EXAMPLE_TIMESTAMP = '2026-09-27T14:05:12.345Z';

const ERROR_NAMES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  404: 'Not Found',
  409: 'Conflict',
};

/**
 * Documenta un error lanzado con una excepción HTTP de Nest y un mensaje
 * propio, que el filtro entrega como `{ message, error, statusCode }`.
 * @param status Código HTTP.
 * @param path Ruta de ejemplo, con el prefijo de la API.
 * @param description Cuándo ocurre, en español.
 * @param message Mensaje real de la excepción.
 */
export function httpError(
  status: number,
  path: string,
  description: string,
  message: string | string[],
): ErrorResponseSpec {
  return {
    status,
    description,
    example: {
      statusCode: status,
      path,
      timestamp: EXAMPLE_TIMESTAMP,
      message: { message, error: ERROR_NAMES[status], statusCode: status },
    },
  };
}

/** 400 del `ValidationPipe` global, con la lista de mensajes por campo. */
export function validationError(
  path: string,
  messages: string[],
  description = 'Datos de entrada inválidos',
): ErrorResponseSpec {
  return httpError(400, path, description, messages);
}

/** 401 del guard global cuando falta el token o no es válido. */
export function unauthorizedError(path: string): ErrorResponseSpec {
  return {
    status: 401,
    description: 'Token ausente, vencido o inválido',
    example: {
      statusCode: 401,
      path,
      timestamp: EXAMPLE_TIMESTAMP,
      message: { message: 'Unauthorized', statusCode: 401 },
    },
  };
}

/** 429 del límite de peticiones; aquí `message` llega como texto. */
export function tooManyRequestsError(
  path: string,
  description = 'Se superó el límite global de peticiones por minuto',
): ErrorResponseSpec {
  return {
    status: 429,
    description,
    example: {
      statusCode: 429,
      path,
      timestamp: EXAMPLE_TIMESTAMP,
      message: 'ThrottlerException: Too Many Requests',
    },
  };
}
