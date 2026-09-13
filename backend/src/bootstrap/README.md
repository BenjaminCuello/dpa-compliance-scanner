# bootstrap

Pasos de inicialización que se ejecutan sobre la instancia de la aplicación.

- `swagger.setup.ts`: publica la documentación OpenAPI en `/{API_PREFIX}/docs`.
- `proxy.setup.ts`: declara los proxies de confianza según `TRUST_PROXY_HOPS`,
  para que los límites de peticiones se apliquen por cliente y no por proxy.

Mantener aquí la configuración de arranque evita que `main.ts` crezca sin control.
