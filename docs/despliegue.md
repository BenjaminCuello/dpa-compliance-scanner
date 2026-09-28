# Despliegue

La guía completa se agrega al publicar la aplicación en Render.

## Variables al desplegar

Al publicar la aplicación hay que definir estas variables en el servicio de
hosting, como secretos y nunca en el repositorio:

| Variable | Qué poner | Si falta |
|----------|-----------|----------|
| `JWT_SECRET` | Una cadena aleatoria propia, de al menos 32 caracteres. Distinta a la del `.env.example`. | La aplicación no inicia. |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | Los datos de la base administrada. | La aplicación no inicia. |
| `CORS_ORIGINS` | La URL del frontend publicado, por ejemplo `https://scanner.ejemplo.cl`. | El navegador bloquea las llamadas del frontend. |
| `TRUST_PROXY_HOPS` | `1` si el hosting pone un proxy delante, que es lo habitual. | Todos los usuarios comparten un mismo cupo de peticiones. |
| `DB_MIGRATIONS_RUN` | `true`, para que el esquema se aplique al arrancar. | Las tablas no existen y las consultas fallan. |

Para generar una clave de firma:

```bash
openssl rand -base64 48
```

`TRUST_PROXY_HOPS` debe quedar en `0` en local y en Docker Compose: sin un proxy
real, cualquier cliente podría falsificar su IP para eludir los límites de
peticiones.
