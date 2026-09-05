# database

Configura el acceso a PostgreSQL y la evolución del esquema.

- `typeorm.options.ts`: arma las opciones de TypeORM a partir de los datos de
  conexión. Lo usan tanto la aplicación como el CLI de migraciones, de modo que
  ambos ven las mismas entidades y la misma convención de nombres.
- `database.module.ts`: registra la conexión en Nest tomando la configuración
  validada del entorno.
- `data-source.ts`: fuente de datos que utiliza el CLI de TypeORM. Lee el `.env`
  directamente porque se ejecuta fuera de la aplicación.
- `snake-naming.strategy.ts`: nombra tablas y columnas en snake_case; las
  propiedades de las entidades se mantienen en camelCase.
- `migrations/`: historial de cambios del esquema.

## Migraciones

Con la base de datos levantada (`docker compose up -d db`):

```bash
npm run migration:show                                  # estado actual
npm run migration:run                                   # aplica las pendientes
npm run migration:revert                                # deshace la última
npm run migration:generate -- src/database/migrations/NombreDelCambio
```

`generate` compara las entidades contra el esquema real y escribe la diferencia,
por lo que la base de datos debe estar corriendo y al día antes de generar.

`synchronize` permanece desactivado: el esquema cambia solo mediante migraciones,
que quedan versionadas y se pueden revertir. En los contenedores, la variable
`DB_MIGRATIONS_RUN` hace que las pendientes se apliquen al arrancar.
