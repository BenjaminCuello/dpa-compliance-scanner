# routes

Definición de rutas de la aplicación con React Router.

- `AppRoutes.tsx`: mapa de rutas de la aplicación. `/login` y `/register`
  son públicas; `/dashboard` y `/auditorias` están protegidas y se
  renderizan dentro de `AppLayout`.
- `ProtectedRoute.tsx`: guarda de rutas que exige una sesión autenticada.
  Mientras se valida el token guardado muestra un estado de carga; si no
  hay sesión válida, redirige a `/login`.
