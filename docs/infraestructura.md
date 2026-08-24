# Infraestructura

El entorno se levanta con Docker Compose y consta de dos contenedores:
`dpa_scanner_db` (PostgreSQL 16) y `dpa_scanner_backend` (API NestJS).

## Archivos

| Archivo | Rol |
|---------|-----|
| `backend/Dockerfile` | Imagen del backend, con etapas para desarrollo y producción. |
| `docker-compose.yml` | Definición base: base de datos y backend compilado. |
| `docker-compose.dev.yml` | Sobrescritura para desarrollo con recarga automática. |
| `backend/.dockerignore` | Excluye del contexto de build lo que no debe llegar a la imagen. |
| `.env` | Valores de configuración (ver `.env.example`). |

## Etapas de la imagen del backend

| Etapa | Uso |
|-------|-----|
| `deps` | Instala las dependencias; base común de las demás etapas. |
| `development` | Ejecuta `npm run start:dev` con el código montado desde el host. |
| `builder` | Compila TypeScript a `dist/`. |
| `production` | Copia solo `dist/` y las dependencias de producción; corre como usuario `node`. |

## Modos de ejecución

Producción, que es el modo por defecto y equivale a lo que se despliega:

```bash
docker compose up --build
```

Desarrollo, con recarga automática al guardar archivos de `backend/src`:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

En desarrollo, `backend/src` se monta desde el host, así que un cambio en el
código reinicia la aplicación sin reconstruir la imagen. `node_modules` vive
dentro del contenedor y no se comparte con el host.

## Comunicación entre servicios

Ambos contenedores comparten la red que crea Compose, donde cada servicio es
alcanzable por su nombre. Por eso el backend usa `DB_HOST=db` y no `localhost`:
dentro del contenedor, `localhost` es el propio backend.

El backend no arranca hasta que la base de datos supera su `healthcheck`
(`pg_isready`), evitando los reintentos de conexión durante el arranque.

A su vez, el backend expone su propio `healthcheck` contra `GET /api/health`,
que consulta la base de datos. Si ese endpoint responde, la comunicación entre
ambos contenedores está confirmada:

```bash
docker compose ps
curl http://localhost:3000/api/health
```

Estado esperado: ambos contenedores en `(healthy)` y la respuesta
`{"status":"ok","database":true,...}`.

## Datos y credenciales

Los datos de PostgreSQL persisten en el volumen `postgres_data`, que sobrevive a
`docker compose down`. Las credenciales se aplican solo al crear el volumen: si
se cambian después, hay que recrearlo con `docker compose down -v`, lo que borra
los datos.

## Puertos

| Servicio | Host | Contenedor |
|----------|------|------------|
| backend | `${PORT}` (3000) | 3000 |
| db | `${DB_PORT}` (5432) | 5432 |

El puerto de la base de datos se publica para poder inspeccionarla con un cliente
SQL durante el desarrollo. Al desplegar no debería publicarse.
