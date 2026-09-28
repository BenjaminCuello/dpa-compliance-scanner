# common

Componentes transversales, sin lógica de negocio, reutilizables por cualquier módulo.

- `filters/http-exception.filter.ts`: filtro global que unifica el formato de las
  respuestas de error de la API.
- `dto/`: `ErrorResponseDto`, el esquema OpenAPI de ese formato de error.
- `swagger/`: decorador `ApiErrorResponses` y ejemplos para documentar los
  errores de cada endpoint.
- `database/`: utilidades para interpretar errores de PostgreSQL.
- `entities/`: entidad base con los campos comunes.

El filtro se registra en `bootstrap/app.setup.ts` para que aplique a toda la API.
