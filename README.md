# DPA Compliance Scanner

[![CI](https://github.com/BenjaminCuello/dpa-compliance-scanner/actions/workflows/ci.yml/badge.svg)](https://github.com/BenjaminCuello/dpa-compliance-scanner/actions/workflows/ci.yml)

Aplicación que audita si un proyecto o repositorio cumple con controles técnicos
relacionados a la **Ley 21.719** de protección de datos personales, y presenta los
resultados en un dashboard con gráficos.

## Stack

| Capa | Tecnología |
|------|------------|
| Base de datos | PostgreSQL |
| Backend | NestJS (REST + Swagger) |
| Frontend | React |
| Contenedores | Docker / Docker Compose |
| CI | GitHub Actions |

Arquitectura **monolítica** con separación interna entre `backend/` y `frontend/`
dentro de un único repositorio.

## Estructura del repositorio

```
.
├── .github/workflows/       # Integración continua
├── backend/                 # API NestJS (ver backend/README.md)
├── frontend/                # Aplicación React (pendiente)
├── docs/                    # Documentación transversal
├── docker-compose.yml       # PostgreSQL + backend
└── docker-compose.dev.yml   # Sobrescritura para desarrollo
```

## Ejecución local

```bash
cp .env.example .env
docker compose up --build
```

Antes de levantar el entorno hay que definir `JWT_SECRET` en el `.env` con una
cadena de al menos 32 caracteres.

Para desarrollo, con recarga automática al guardar cambios en `backend/src`:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

El `.env` de la raíz configura tanto a PostgreSQL como al backend. Si se cambian
las credenciales cuando el volumen ya existe, hay que recrearlo con
`docker compose down -v`.

Detalle de imágenes, redes y volúmenes en [docs/infraestructura.md](docs/infraestructura.md).

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`

## Estado del proyecto

### Completado

- [x] Backend NestJS: estructura por capas, configuración por entorno, conexión a
      PostgreSQL vía TypeORM y documentación Swagger.
- [x] Endpoint `GET /api/health` con pruebas unitarias.
- [x] Contenedores de backend y base de datos, con modos de desarrollo y
      producción y verificación de estado de ambos servicios.
- [x] Modelo de datos y migraciones en PostgreSQL.
- [x] Autenticación con JWT: registro, inicio de sesión y protección de los
      endpoints.
- [x] Motor de escaneo con Semgrep y catálogo inicial de controles sobre
      secretos expuestos y configuraciones inseguras.
- [x] Endpoints REST para iniciar auditorías de repositorios públicos,
      consultar sus resultados y revisar el historial.
- [x] Pruebas unitarias y de integración del backend, estas últimas contra la
      API y la base de datos reales.
- [x] Integración continua en GitHub Actions: estilo, compilación, pruebas con
      cobertura, reglas de escaneo e imagen de Docker.

### Pendiente

- [ ] **Frontend React**: dashboard con gráficos de cumplimiento y detalle de hallazgos.
- [ ] **Despliegue automático** a un servicio gratuito con base de datos PostgreSQL
      administrada.
