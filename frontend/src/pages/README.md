# pages

Componentes de página: cada archivo representa una ruta completa y se
conecta con `src/routes/AppRoutes.tsx`.

- `LoginPage.tsx`: formulario de inicio de sesión, usa `useAuth()` para
  autenticar contra el backend. Con `?sesion=expirada` muestra un aviso
  informativo (no de error); al ingresar navega a `/dashboard` sin el
  parámetro.
- `RegisterPage.tsx`: formulario de registro de cuenta, usa `useAuth()`
  para crear la cuenta y autenticarla.
- `DashboardPage.tsx`: ruta `/dashboard`. Usa `useDashboardData` y
  `useProjectFilter` y compone el filtro por proyecto, el botón
  "Actualizar" y la vista "Todos los proyectos" o la de un proyecto (ver
  `src/features/dashboard/`). Sin auditorías muestra un estado vacío con
  enlace a `/auditorias`; si falla el listado, el error con "Reintentar"; al
  recargar deja el contenido anterior con opacidad reducida. Se carga en
  diferido (ver `src/routes/`). Sus pruebas están en tres archivos: vista de
  todos, vista de un proyecto y estados.
- `AuditsPage.tsx`: ruta `/auditorias`. Formulario para iniciar una
  auditoría e historial paginado (20 por página) con filtro por estado; al
  cambiar el filtro vuelve a la página 1. Compone los componentes de
  `src/features/audits/components/`.
- `AuditDetailPage.tsx`: ruta `/auditorias/:id`. Usa `useAuditPolling` y
  muestra el encabezado de la auditoría y, según su estado, el progreso
  (`pending` / `running`), el aviso con `errorMessage` (`failed`) o los
  totales y la lista de controles (`completed`). Si la auditoría no existe,
  es ajena o el id no es válido, muestra "Auditoría no encontrada" con un
  enlace al historial. Si una consulta falla con la auditoría ya cargada,
  conserva lo que había y ofrece "Reintentar".

Cada página fija el título de la pestaña con `usePageTitle` (ver
`src/lib/document/`); el detalle usa "Auditoría de <proyecto>" y, mientras
carga, "Auditoría".

Las páginas no deberían contener lógica de negocio compleja: esa lógica vive
en `src/features/`.
