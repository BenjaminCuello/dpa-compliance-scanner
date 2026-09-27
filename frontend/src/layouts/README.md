# layouts

Estructura de página compartida por las vistas autenticadas.

- `AppLayout.tsx`: envuelve las páginas protegidas con `Sidebar` y
  renderiza la ruta activa mediante `<Outlet />`. El `<main>` lleva
  `min-w-0` para que el contenido ancho (p. ej. tablas) haga scroll dentro
  de su contenedor y no en la página.
- `Sidebar.tsx`: navegación lateral hacia `/dashboard` y `/auditorias`, con
  el nombre de la persona autenticada, el cambio de tema y el botón para
  cerrar sesión.

`AppLayout` se usa desde `src/routes/AppRoutes.tsx` como elemento contenedor
de las rutas protegidas.
