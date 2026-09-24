# bootstrap

Pasos de inicialización que se ejecutan sobre la instancia de la aplicación.

- `app.setup.ts`: configuración común de la API (cabeceras seguras, CORS,
  prefijo, validación de entrada y formato de errores). Vive aquí para que las
  pruebas de integración levanten la aplicación igual que en producción.
- `swagger.setup.ts`: publica la documentación OpenAPI en `/{API_PREFIX}/docs`.
- `proxy.setup.ts`: declara los proxies de confianza según `TRUST_PROXY_HOPS`,
  para que los límites de peticiones se apliquen por cliente y no por proxy.

Mantener aquí la configuración de arranque evita que `main.ts` crezca sin control.
