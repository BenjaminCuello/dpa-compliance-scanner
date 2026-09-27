# routes

Definición de rutas de la aplicación con React Router.

- `AppRoutes.tsx`: mapa de rutas de la aplicación. `/login` y `/register`
  son públicas; `/dashboard`, `/auditorias` y `/auditorias/:id` están
  protegidas y se renderizan dentro de `AppLayout`. Cualquier otra ruta
  redirige a `/dashboard`.
- `ProtectedRoute.tsx`: guarda de rutas que exige una sesión autenticada.
  Mientras se valida el token guardado muestra un estado de carga; si no
  hay sesión válida, redirige a `/login`.
