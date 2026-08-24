# health

Expone `GET /{API_PREFIX}/health` para verificar que el servicio está operativo.

- `health.controller.ts`: define la ruta y su documentación Swagger.
- `health.service.ts`: ejecuta `SELECT 1` contra PostgreSQL y devuelve `ok` o
  `degraded` según el resultado.
- `dto/health-response.dto.ts`: contrato de la respuesta.
- `*.spec.ts`: pruebas unitarias del controlador y del servicio.
