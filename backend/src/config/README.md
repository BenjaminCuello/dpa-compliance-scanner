# config

Centraliza la configuración de la aplicación.

- `env.validation.ts`: esquema Joi que valida el `.env` al iniciar. Si falta una
  variable obligatoria la aplicación no arranca.
- `app.config.ts`: namespace `app` (puerto, prefijo de la API, CORS, rate limit).
- `database.config.ts`: namespace `database` (credenciales de PostgreSQL).
- `index.ts`: punto único de importación.

Los valores se leen con `ConfigService.get('app.port')` o
`ConfigService.get('database.host')`. Ningún valor sensible se escribe en el código.
