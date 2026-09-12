# projects

Entidad `Project`: el repositorio o proyecto que se audita.

- `entities/project.entity.ts`: nombre, descripción opcional, URL del repositorio
  y su dueño. La restricción `uq_projects_owner_name` impide que una misma
  persona repita el nombre de un proyecto.
- `projects.service.ts`: busca proyectos del usuario y crea el proyecto de un
  repositorio en su primera auditoría. Un proyecto ajeno se trata como
  inexistente.

Relaciones: pertenece a un `User` y tiene muchas `Audit`.

Los proyectos se crean al iniciar una auditoría; no hay endpoints propios de
gestión de proyectos.
