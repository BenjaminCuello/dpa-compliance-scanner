# DPA Compliance Scanner

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
├── backend/            # API NestJS (ver backend/README.md)
├── frontend/           # Aplicación React (pendiente)
└── docker-compose.yml  # PostgreSQL + backend
```

## Ejecución local

```bash
cp .env.example .env
docker compose up --build
```

El `.env` de la raíz configura tanto a PostgreSQL como al backend. Si se cambian
las credenciales cuando el volumen ya existe, hay que recrearlo con
`docker compose down -v`.

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`

## Estado del proyecto

### Completado

- [x] Backend NestJS: estructura por capas, configuración por entorno, conexión a
      PostgreSQL vía TypeORM, documentación Swagger y contenedores.
- [x] Endpoint `GET /api/health` con pruebas unitarias.

### Pendiente

- [ ] **Modelo de datos**: entidades `Project`, `Scan`, `Rule`, `Finding` y
      migraciones de TypeORM.
- [ ] **Catálogo de controles** derivados de la Ley 21.719 (cifrado, gestión de
      secretos, políticas de retención, consentimiento, registro de accesos, etc.),
      con su ponderación para el puntaje de cumplimiento.
- [ ] **Motor de scanner**: análisis del repositorio objetivo y generación de
      hallazgos por control.
- [ ] **Endpoints REST** de proyectos, escaneos y reportes, documentados en Swagger.
- [ ] **Frontend React**: dashboard con gráficos de cumplimiento y detalle de hallazgos.
- [ ] **Pipeline GitHub Actions**: lint, build y pruebas en cada push y pull request.
- [ ] **Despliegue automático** a un servicio gratuito con base de datos PostgreSQL
      administrada.
