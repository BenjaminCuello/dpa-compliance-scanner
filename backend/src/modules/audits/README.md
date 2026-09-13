# audits

Inicio, ejecución y consulta de auditorías.

## Endpoints

Todos requieren token.

| Método | Ruta | Respuesta | Descripción |
|--------|------|-----------|-------------|
| POST | `/audits` | 202 | Inicia una auditoría y responde sin esperar el escaneo. |
| GET | `/audits` | 200 | Historial del usuario, paginado y filtrable por proyecto y estado. |
| GET | `/audits/:id` | 200 | Estado, puntaje y resultado de cada control. |

### Iniciar

Se envía un repositorio nuevo o un proyecto existente, no ambos:

```json
{ "repositoryUrl": "https://github.com/organizacion/proyecto", "projectName": "Portal" }
```

```json
{ "projectId": "03dfb24b-72f3-4183-8573-306fc5c98e00" }
```

Con `repositoryUrl`, el proyecto se crea en su primera auditoría y se reutiliza
en las siguientes. `projectName` es opcional; por omisión se usa la ruta del
repositorio (`organizacion/proyecto`).

La respuesta trae la auditoría en `pending`. Para seguir su avance se consulta
`GET /audits/:id` hasta que el estado sea `completed` o `failed`.

### Historial

`GET /audits?projectId=...&status=completed&page=1&limit=20`

Todos los filtros son opcionales. `limit` admite hasta 100. Los resultados van
del más reciente al más antiguo.

### Errores

| Código | Cuándo |
|--------|--------|
| 400 | URL inválida, datos faltantes o se envían URL y proyecto a la vez. |
| 404 | La auditoría o el proyecto no existen o pertenecen a otra persona. |
| 409 | El proyecto ya tiene una auditoría en curso, o el nombre ya está en uso. |
| 429 | Más de 5 auditorías iniciadas en un minuto. |

## Ciclo de una auditoría

```
pending ──> running ──> completed
                   └──> failed
```

1. `AuditsService.start` registra la auditoría y la entrega a `AuditRunnerService`.
2. El runner la ejecuta cuando hay cupo (`AUDIT_MAX_CONCURRENT`).
3. `RepositoryFetcherService` clona el repositorio en el directorio de trabajo.
4. `ScannerService` lo analiza.
5. Los resultados y el estado final se guardan en una sola transacción.
6. El código clonado se borra, haya terminado bien o mal.

Si falla, `errorMessage` explica el motivo con un texto pensado para el usuario.

## Archivos

| Archivo | Responsabilidad |
|---------|-----------------|
| `audits.controller.ts` | Endpoints y documentación Swagger. |
| `audits.service.ts` | Inicio, historial y detalle, siempre acotados al usuario. |
| `audit-project.resolver.ts` | Decide sobre qué proyecto corre la auditoría. |
| `execution/audit-runner.service.ts` | Ejecución en segundo plano y recuperación tras reinicios. |
| `execution/concurrency-limiter.ts` | Máximo de auditorías simultáneas. |
| `execution/audit-results.mapper.ts` | Reporte del escáner a filas de `check_results` y puntaje. |
| `execution/audit-failure.ts` | Mensajes de error aptos para mostrar. |
| `repository/repository-url.ts` | Validación y normalización de URLs. |
| `repository/repository-fetcher.service.ts` | Clonado, límite de tamaño y limpieza. |
| `mappers/audit-response.mapper.ts` | Entidades a respuestas de la API. |
| `dto/` | Contratos de entrada y salida. |
| `entities/`, `enums/` | Modelo de datos. |

## Cómo se guardan los resultados

Cada auditoría guarda en `check_results` una fila por control aprobado y una por
cada hallazgo de los controles fallidos. Así queda registro de todo lo evaluado,
no solo de lo que falló. El detalle las vuelve a agrupar por control y completa
categoría y remediación desde el catálogo vigente.

`complianceScore` es el porcentaje de controles aprobados, con dos decimales.

## Seguridad

- **Solo repositorios públicos por HTTPS** en los hosts de
  `AUDIT_ALLOWED_GIT_HOSTS`. Se rechazan otros protocolos, puertos, parámetros y
  credenciales dentro de la URL: el clonado no puede usarse para alcanzar
  servicios internos.
- **git corre sin shell, superficial (`--depth 1`), sin pedir credenciales y sin
  crear enlaces simbólicos**, con tiempo y tamaño máximos.
- **Una sola auditoría en curso por proyecto**, garantizada por el índice único
  parcial `uq_audits_active_per_project`; resiste solicitudes simultáneas.
- **Cada usuario solo ve lo suyo.** Las auditorías y proyectos ajenos responden
  404, igual que los inexistentes, para no revelar que existen.
- **Reinicios:** al arrancar, las auditorías que quedaron en `pending` o
  `running` pasan a `failed` y se borran los clones que quedaron a medias. Solo
  se eliminan carpetas con nombre de auditoría, de modo que un
  `SCANNER_WORKSPACE_DIR` mal configurado no borra otros archivos.
