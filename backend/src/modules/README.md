# modules

Módulos de dominio. Cada uno agrupa su controlador, servicio, DTOs y pruebas, y se
importa desde `app.module.ts`.

- `health/`: endpoint de diagnóstico del servicio y sus dependencias.
- `users/`: entidad de usuario.
- `projects/`: proyectos o repositorios a auditar.
- `audits/`: auditorías y el resultado de cada control evaluado.

`users`, `projects` y `audits` contienen por ahora solo el modelo de datos; sus
servicios y endpoints se agregan en las tareas siguientes.
