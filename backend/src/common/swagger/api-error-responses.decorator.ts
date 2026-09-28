import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { ErrorResponseSpec } from './error-examples';

/**
 * Documenta las respuestas de error de un endpoint con el esquema común
 * `ErrorResponseDto`, su descripción y un ejemplo del cuerpo real.
 * @param specs Una entrada por código de estado.
 */
export function ApiErrorResponses(
  ...specs: ErrorResponseSpec[]
): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiExtraModels(ErrorResponseDto),
    ...specs.map(({ status, description, example }) =>
      ApiResponse({
        status,
        description,
        content: {
          'application/json': {
            schema: { $ref: getSchemaPath(ErrorResponseDto) },
            example,
          },
        },
      }),
    ),
  );
}
