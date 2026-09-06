# pages

Componentes de página: cada archivo representa una ruta completa y se
conecta con `src/routes/AppRoutes.tsx`.

- `LoginPage.tsx`: formulario de inicio de sesión, usa `useAuth()` para
  autenticar contra el backend.
- `RegisterPage.tsx`: formulario de registro de cuenta, usa `useAuth()`
  para crear la cuenta y autenticarla.
- `DashboardPage.tsx`: panel principal de cumplimiento (contenido pendiente
  para una etapa posterior).
- `AuditsPage.tsx`: listado de auditorías (contenido pendiente para una
  etapa posterior).

Las páginas no deberían contener lógica de negocio compleja: esa lógica vive
en `src/features/`.
