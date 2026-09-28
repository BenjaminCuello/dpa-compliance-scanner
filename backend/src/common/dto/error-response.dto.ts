import { ApiProperty } from '@nestjs/swagger';

/**
 * Cuerpo de toda respuesta de error de la API, tal como lo arma
 * `HttpExceptionFilter`. Solo documenta el contrato: no se instancia.
 */
export class ErrorResponseDto {
  @ApiProperty({ example: 409, description: 'Código HTTP de la respuesta' })
  statusCode: number;

  @ApiProperty({
    example: '/api/audits',
    description: 'Ruta de la petición que falló',
  })
  path: string;

  @ApiProperty({
    format: 'date-time',
    example: '2026-09-27T14:05:12.345Z',
    description: 'Momento del error en formato ISO 8601',
  })
  timestamp: string;

  @ApiProperty({
    description:
      'Detalle del error. Suele ser un objeto `{ message, error, statusCode }`, ' +
      'donde `message` es un texto o, en errores de validación, la lista de ' +
      'mensajes por campo. El límite de peticiones lo entrega como texto.',
    oneOf: [
      { type: 'string' },
      { type: 'array', items: { type: 'string' } },
      { type: 'object', additionalProperties: true },
    ],
    example: {
      message: 'El proyecto ya tiene una auditoría en curso',
      error: 'Conflict',
      statusCode: 409,
    },
  })
  message: string | string[] | Record<string, unknown>;
}
