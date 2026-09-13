# Backend — DPA Compliance Scanner

API REST construida con NestJS y PostgreSQL que audita controles técnicos
asociados a la Ley 21.719 de protección de datos personales.

## Requisitos

- Node.js 22 o superior
- Docker y Docker Compose (recomendado para la base de datos)

## Puesta en marcha

1. Levantar la base de datos y el backend con Docker Compose (desde la raíz del
   repositorio). Las credenciales provienen del `.env` de la raíz; ver
   `../.env.example`:

   ```bash
   docker compose up --build
   ```

2. Alternativa sin Docker para el backend (la base de datos sigue en contenedor).
   Aquí sí se usa el `.env` de esta carpeta:

   ```bash
   docker compose up -d db
   cp backend/.env.example backend/.env
   npm install
   npm run start:dev
   ```

3. Verificar el estado del servicio:

   ```bash
   curl http://localhost:3000/api/health
   ```

- API: `http://localhost:3000/api`
- Documentación Swagger: `http://localhost:3000/api/docs`

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run start:dev` | Servidor en modo desarrollo con recarga automática. |
| `npm run build` | Compila TypeScript a `dist/`. |
| `npm test` | Ejecuta las pruebas unitarias. |
| `npm run test:cov` | Pruebas con reporte de cobertura. |
| `npm run lint` | Analiza y corrige el estilo del código. |
| `npm run test:rules` | Verifica las reglas de Semgrep contra sus casos de prueba. |
| `npm run migration:run` | Aplica las migraciones pendientes. |
| `npm run migration:generate` | Genera una migración desde los cambios en las entidades. |

## Variables de entorno

Todas están descritas en `.env.example` y se validan al iniciar mediante Joi
(`src/config/env.validation.ts`). Si falta una variable obligatoria la aplicación
falla de inmediato en lugar de arrancar mal configurada.

Hay dos formas de entregarlas, según cómo se ejecute el backend:

- **Con Docker Compose**: las define el `.env` de la raíz del repositorio, que
  configura a la vez a PostgreSQL y al backend. Así ambos contenedores comparten
  siempre las mismas credenciales.
- **Sin Docker** (`npm run start:dev`): las define el `.env` de esta carpeta.

El archivo `.env` está excluido del control de versiones y no debe compartirse.

## Autenticación

La API exige un token JWT en todos los endpoints, salvo los marcados como
públicos (`/auth/register`, `/auth/login` y `/health`). El token se obtiene al
registrarse o iniciar sesión y se envía en el encabezado
`Authorization: Bearer <token>`.

`JWT_SECRET` es obligatoria y debe tener al menos 32 caracteres; la aplicación no
inicia sin ella. Ver `src/modules/auth/README.md`.

## Auditorías

`POST /audits` inicia el análisis de un repositorio público y responde de
inmediato; el avance y los resultados se consultan en `GET /audits/:id`, y el
historial en `GET /audits`. Detalle del contrato y del ciclo de ejecución en
`src/modules/audits/README.md`.

## Despliegue detrás de un proxy

Los servicios de hosting suelen poner un proxy delante de la aplicación. En ese
caso hay que definir `TRUST_PROXY_HOPS` con la cantidad de proxies (normalmente
`1`). Sin esto, todas las peticiones parecen venir de la misma IP y los límites
de peticiones se agotan entre todos los usuarios a la vez.

En local y en Docker Compose debe quedar en `0`: sin un proxy real, cualquier
cliente podría falsificar su IP para eludir los límites.

## Motor de escaneo

El análisis de los proyectos lo hace Semgrep, que viene instalado en la imagen de
Docker. Para ejecutar el backend fuera de Docker hay que instalarlo aparte
(`pipx install semgrep`) o indicar su ubicación en `SEMGREP_BIN`.

El backend clona los repositorios con `git`, también incluido en la imagen. Los
proyectos solo se pueden escanear si están dentro de `SCANNER_WORKSPACE_DIR`.
Las reglas y el catálogo de controles están en `semgrep/README.md`; el
funcionamiento del módulo, en `src/modules/scanner/README.md`.

## Base de datos

El esquema se gestiona con migraciones de TypeORM. Ver `src/database/README.md`
para los comandos y el detalle del modelo de datos.

## Estructura

Cada carpeta relevante incluye su propio `README.md`. Ver `src/README.md` para el
mapa general de la aplicación.
