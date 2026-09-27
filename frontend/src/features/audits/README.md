# features/audits

Capa de datos de las auditorías: iniciar una auditoría, consultar el historial
y seguir el avance de una auditoría hasta que termina. No contiene UI.

- `types.ts`: tipos que reflejan los DTOs del backend (`StartAuditDto`,
  `ListAuditsQueryDto`, `AuditSummaryDto`, `AuditListDto`, `AuditDetailDto` y
  sus partes) y los enums `AuditStatus`, `CheckSeverity` y `CheckStatus` como
  uniones de texto. `StartAuditPayload` impide por tipo enviar
  `repositoryUrl` y `projectId` a la vez.
- `auditsService.ts`: llamadas HTTP a `POST /audits`, `GET /audits` y
  `GET /audits/:id` usando el cliente de `src/lib/http`. `list` no envía los
  filtros vacíos.
- `labels.ts`: textos en español de estados y severidades, y `SEVERITY_ORDER`
  / `compareSeverity` para ordenar de más a menos severo.
- `compliance.ts`: umbrales del puntaje de cumplimiento y
  `classifyComplianceScore`, que devuelve `good`, `fair`, `low` o `none`
  (sin puntaje). Pensado para reutilizarse en el dashboard.
- `useAuditPolling.ts`: carga el detalle de una auditoría y lo vuelve a
  consultar cada 3 segundos mientras esté en `pending` o `running`. Expone
  `{ audit, error, isLoading, notFound, retry }`; `notFound` es `true` ante un
  404 o un 400.
- `useAuditHistory.ts`: historial paginado y filtrado. Expone
  `{ data, error, isLoading, reload }` y conserva la página anterior mientras
  carga la siguiente.

## Decisiones de diseño

- **Polling con `setTimeout` encadenado** en vez de `setInterval`: la
  siguiente consulta se programa solo cuando termina la anterior, así nunca
  hay dos peticiones en paralelo si el backend tarda más de 3 segundos. El
  polling se detiene al terminar la auditoría, ante un error, al cambiar el
  `id` y al desmontar; `retry` lo reanuda desde cero.
- **Estado asociado a la petición:** ambos hooks guardan junto al resultado
  la clave de la petición que lo produjo (id o parámetros). `isLoading` se
  deriva comparando esa clave con la actual, y las respuestas de peticiones
  anteriores que llegan tarde se descartan.
