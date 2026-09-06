# layouts

Estructura de página compartida por las vistas autenticadas.

- `AppLayout.tsx`: envuelve las páginas protegidas con `Header` y `Sidebar`,
  y renderiza la ruta activa mediante `<Outlet />`.
- `Header.tsx`: barra superior con el nombre de la persona autenticada y el
  botón para cerrar sesión.
- `Sidebar.tsx`: navegación lateral hacia `/dashboard` y `/auditorias`.

`AppLayout` se usa desde `src/routes/AppRoutes.tsx` como elemento contenedor
de las rutas protegidas.
