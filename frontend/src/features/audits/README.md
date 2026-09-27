# features/audits

Dominio de las auditorías: iniciar una auditoría, consultar el historial y
seguir el avance de una auditoría hasta que termina. La capa de datos está en
la raíz de la carpeta y los componentes visuales del dominio en
`components/`.

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
- `useStartAudit.ts`: inicia una auditoría (repositorio nuevo o
  `{ projectId }`) y navega a `/auditorias/:id`. Expone
  `{ start, isSubmitting, error, clearError }`; `error` ya viene legible.

## components/

Componentes que dependen de los tipos, textos o umbrales del dominio. Los
genéricos (badge base, estados de carga, vacío y error, paginación) están en
`src/components/`.

- `AuditStatusBadge.tsx`, `CheckStatusBadge.tsx`: estado de la auditoría y
  resultado del control con texto de `labels.ts`, ícono y color.
- `SeverityBadge.tsx`: severidad con los tokens `severity-*` de `index.css`.
- `ComplianceScore.tsx`: puntaje con un decimal (`85,5%`) o `—`, coloreado
  según `compliance.ts`; el nivel ("Bueno", "Regular", "Bajo") queda como
  texto para lectores de pantalla y en el `title`.
- `NewAuditForm.tsx`: formulario "Nueva auditoría" (URL del repositorio y
  nombre opcional).
- `AuditHistoryFilter.tsx`: selector de estado con "Todos".
- `AuditHistoryTable.tsx` y `AuditHistoryRow.tsx`: tabla del historial con
  scroll horizontal propio y la acción "Volver a auditar", deshabilitada
  mientras la auditoría está en `pending` o `running`. El acceso al detalle
  por teclado es el enlace del nombre del proyecto; el clic en el resto de la
  fila es un atajo para el mouse.

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
