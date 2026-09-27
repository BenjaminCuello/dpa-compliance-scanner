# pages

Componentes de página: cada archivo representa una ruta completa y se
conecta con `src/routes/AppRoutes.tsx`.

- `LoginPage.tsx`: formulario de inicio de sesión, usa `useAuth()` para
  autenticar contra el backend.
- `RegisterPage.tsx`: formulario de registro de cuenta, usa `useAuth()`
  para crear la cuenta y autenticarla.
- `DashboardPage.tsx`: panel principal de cumplimiento (contenido pendiente
  para una etapa posterior).
- `AuditsPage.tsx`: ruta `/auditorias`. Formulario para iniciar una
  auditoría e historial paginado (20 por página) con filtro por estado; al
  cambiar el filtro vuelve a la página 1. Compone los componentes de
  `src/features/audits/components/`.

Las páginas no deberían contener lógica de negocio compleja: esa lógica vive
en `src/features/`.
