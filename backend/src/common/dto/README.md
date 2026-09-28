# dto

DTOs compartidos por toda la API. Solo describen contratos para la
documentación OpenAPI; no contienen lógica.

- `error-response.dto.ts`: `ErrorResponseDto`, el cuerpo de toda respuesta de
  error tal como lo entrega `HttpExceptionFilter`:
  `{ statusCode, path, timestamp, message }`. `message` puede ser un texto, una
  lista de textos o un objeto `{ message, error, statusCode }`; este último es
  el caso habitual, y en los errores de validación su `message` es la lista de
  mensajes por campo.
