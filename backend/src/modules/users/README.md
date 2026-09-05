# users

Entidad `User`: la persona que usa la plataforma y es dueña de los proyectos.

- `entities/user.entity.ts`: correo único, nombre, hash de contraseña e indicador
  de cuenta activa. El hash se declara con `select: false`, así que no viaja en
  las consultas salvo que se pida de forma explícita.

Relación: un usuario tiene muchos proyectos. Al eliminarlo se eliminan sus
proyectos y, en cadena, sus auditorías y resultados.

El módulo de autenticación y los servicios de este dominio se implementan en una
tarea posterior; por ahora la carpeta solo contiene el modelo.
