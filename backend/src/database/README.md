# database

Configura el acceso a PostgreSQL.

- `database.module.ts`: registra `TypeOrmModule.forRootAsync` usando el namespace
  `database` de la configuración. `autoLoadEntities` incorpora automáticamente las
  entidades declaradas por cada módulo de dominio con `TypeOrmModule.forFeature`.

Las migraciones y entidades del scanner se agregarán en esta carpeta y en los
módulos correspondientes. `synchronize` permanece desactivado salvo en desarrollo.
