# test

Pruebas de integración: levantan la aplicación completa y la consultan por HTTP,
como lo haría el frontend.

Las pruebas unitarias viven junto al código que prueban, en `src/`.

## Qué se prueba de verdad

Solo se reemplazan las dos dependencias externas al proyecto: el clonado con git
y la ejecución de Semgrep. El resto es el mismo código que corre en producción,
incluidos los guards, la validación de entrada, TypeORM y PostgreSQL.

| Archivo                         | Cubre                                                        |
| ------------------------------- | ------------------------------------------------------------ |
| `auth.e2e-spec.ts`              | Registro, inicio de sesión, perfil y protección con token.   |
| `audits-flow.e2e-spec.ts`       | Auditoría de principio a fin, y sus formas de fallar.        |
| `audits-history.e2e-spec.ts`    | Historial, filtros, paginación y aislamiento entre usuarios. |
| `audits-validation.e2e-spec.ts` | URLs rechazadas y validación de parámetros.                  |
| `audits-rate-limit.e2e-spec.ts` | Límite de auditorías por minuto.                             |
| `health.e2e-spec.ts`            | Estado del servicio y formato de error de la API.            |

## Cómo ejecutarlas

Necesitan PostgreSQL corriendo:

```bash
docker compose up -d db
cd backend && npm run test:e2e
```

Usan la base `dpa_scanner_test`, aparte de la de desarrollo. Se crea sola en la
primera ejecución y las migraciones se aplican al iniciar la aplicación. Cada
prueba parte con las tablas vacías.

Si PostgreSQL no está disponible, las pruebas fallan con un mensaje que explica
qué levantar.
