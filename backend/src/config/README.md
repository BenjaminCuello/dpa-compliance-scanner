# config

Centraliza la configuración de la aplicación.

- `env.validation.ts`: esquema Joi que valida el `.env` al iniciar. Si falta una
  variable obligatoria la aplicación no arranca.
- `app.config.ts`: namespace `app` (puerto, prefijo de la API, CORS, rate limit).
- `auth.config.ts`: namespace `auth` (clave de firma, vigencia del token y costo
  de bcrypt).
- `scanner.config.ts`: namespace `scanner` (ejecutable de Semgrep, carpeta de
  reglas, directorio de trabajo y tiempo máximo del escaneo).
- `database.config.ts`: namespace `database` (credenciales de PostgreSQL).
- `index.ts`: punto único de importación.

Los valores se leen con `ConfigService.get('app.port')` o
`ConfigService.get('database.host')`. Ningún valor sensible se escribe en el código.
