# users

Entidad `User`: la persona que usa la plataforma y es dueña de los proyectos.

- `entities/user.entity.ts`: correo único, nombre, hash de contraseña e indicador
  de cuenta activa. El hash se declara con `select: false`, así que no viaja en
  las consultas salvo que se pida de forma explícita.

Relación: un usuario tiene muchos proyectos. Al eliminarlo se eliminan sus
proyectos y, en cadena, sus auditorías y resultados.

- `users.service.ts`: búsqueda por correo o identificador y creación de usuarios,
  normalizando el correo a minúsculas. El hash solo se recupera cuando se pide de
  forma explícita, que es lo que hace el inicio de sesión.

Lo consume el módulo `auth`. Los endpoints de gestión de usuarios se agregan en
una tarea posterior.
