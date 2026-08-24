# bootstrap

Pasos de inicialización que se ejecutan sobre la instancia de la aplicación.

- `swagger.setup.ts`: publica la documentación OpenAPI en `/{API_PREFIX}/docs`.

Mantener aquí la configuración de arranque evita que `main.ts` crezca sin control.
