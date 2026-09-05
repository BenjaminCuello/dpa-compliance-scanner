# entities

Piezas base que comparten las entidades del dominio.

- `base.entity.ts`: clase abstracta con el identificador UUID y las marcas de
  creación y actualización. Todas las entidades la extienden para no repetir
  esas columnas.
