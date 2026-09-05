# projects

Entidad `Project`: el repositorio o proyecto que se audita.

- `entities/project.entity.ts`: nombre, descripción opcional, URL del repositorio
  y su dueño. La restricción `uq_projects_owner_name` impide que una misma
  persona repita el nombre de un proyecto.

Relaciones: pertenece a un `User` y tiene muchas `Audit`.
