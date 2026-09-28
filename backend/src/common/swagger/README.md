# swagger

Ayudantes para documentar los endpoints en OpenAPI de forma uniforme.

- `api-error-responses.decorator.ts`: `ApiErrorResponses(...)`, decorador
  compuesto con `applyDecorators` que agrega una respuesta por código de error,
  con el esquema `ErrorResponseDto`, su descripción y un ejemplo del cuerpo.
- `error-examples.ts`: construye esas entradas con el cuerpo real de cada caso:
  `httpError` (excepciones con mensaje propio), `validationError` (400 del
  `ValidationPipe`), `unauthorizedError` (401 del guard) y
  `tooManyRequestsError` (429 del límite de peticiones).
- `openapi-document.spec.ts`: genera el documento sobre los controladores reales
  y verifica los códigos de cada operación, el esquema de error y el parámetro
  `id` de `GET /audits/{id}`.

Uso:

```ts
@ApiErrorResponses(
  unauthorizedError('/api/audits'),
  httpError(404, '/api/audits', 'El proyecto no existe', 'Proyecto no encontrado'),
)
```
