# support

Piezas compartidas por las pruebas de integración.

| Archivo              | Responsabilidad                                                     |
| -------------------- | ------------------------------------------------------------------- |
| `test-app.ts`        | Levanta la aplicación con sus dobles, y ayudantes para consultarla. |
| `accounts.ts`        | Crea cuentas a través de la API y entrega su token.                 |
| `environment.ts`     | Variables de entorno de las pruebas.                                |
| `create-database.ts` | Crea la base de datos de pruebas antes de ejecutarlas.              |
| `repository.fake.ts` | Reemplaza el clonado con git creando un proyecto de mentira.        |
| `semgrep.fake.ts`    | Reemplaza la ejecución de Semgrep y decide qué encuentra.           |

El límite de peticiones se desactiva reemplazando su almacenamiento, no el
guard: el guard global se registra con `APP_GUARD` y `overrideGuard` no lo
alcanza. `createTestApp({ withRateLimit: true })` lo deja activo para probarlo.
