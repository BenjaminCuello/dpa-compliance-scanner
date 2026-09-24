# database

Apoyo para trabajar con la base de datos desde cualquier módulo.

- `unique-violation.ts`: reconoce el error que devuelve PostgreSQL cuando se
  intenta guardar un registro duplicado, para responder un conflicto en lugar
  de un error interno.
