# common

Componentes transversales, sin lógica de negocio, reutilizables por cualquier módulo.

- `filters/http-exception.filter.ts`: filtro global que unifica el formato de las
  respuestas de error de la API.
- `interceptors/`: reservado para interceptores compartidos (logging, transformación
  de respuestas).

Se registran en `main.ts` para que apliquen a toda la API.
