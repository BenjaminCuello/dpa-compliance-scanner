# Prueba del flujo completo

Guía manual para revisar la aplicación de punta a punta antes de publicarla.
Cada paso indica qué hacer y el resultado esperado; marca la casilla cuando
se cumpla. Conviene recorrerla en una ventana privada, para empezar sin
sesión ni tema guardados.

## 1. Levantar el entorno

- [ ] Desde la raíz, con `JWT_SECRET` de 32 o más caracteres en `.env`:
      `docker compose up --build`. Ambos contenedores quedan `healthy` y
      `http://localhost:3000/api/health` responde.
- [ ] En `frontend/`: `cp .env.example .env`, `npm install` y `npm run dev`.
      La app abre en `http://localhost:5173` y redirige a `/login`.

## 2. Registro e inicio de sesión

- [ ] En "Crear cuenta", registrar nombre, correo y contraseña. Entra
      directo al panel y el sidebar muestra el nombre.
- [ ] Registrar otra vez el mismo correo. Aparece "El correo ya está
      registrado".
- [ ] Cerrar sesión: vuelve a `/login`. Entrar con una contraseña incorrecta:
      aparece un error y no hay redirección.
- [ ] Entrar con las credenciales correctas: llega a `/dashboard`.
- [ ] El título de la pestaña cambia en cada página: "Iniciar sesión",
      "Crear cuenta", "Panel", "Auditorías" y "Auditoría de <proyecto>",
      siempre seguido de "· DPA Compliance Scanner".

## 3. Validaciones de la URL

En "Auditorías", formulario "Nueva auditoría":

- [ ] Enviar vacío: el navegador pide completar el campo.
- [ ] `http://github.com/org/repo`: "El repositorio debe usar HTTPS".
- [ ] `https://ejemplo.com/org/repo`: "Solo se admiten repositorios de: …"
      con la lista de hosts permitidos.
- [ ] `https://github.com/org`: "La URL debe apuntar a un repositorio, por
      ejemplo https://github.com/organizacion/proyecto".
- [ ] `https://github.com/org/repo?x=1`: "La URL del repositorio no debe
      incluir parámetros".

## 4. Auditoría completa y detalle de hallazgos

- [ ] Auditar un repositorio público pequeño. Lleva al detalle, que muestra
      "En cola" y luego "En ejecución" sin recargar la página.
- [ ] Al completar: puntaje de cumplimiento, tarjetas de totales y la lista
      de controles con los incumplidos primero, ordenados por severidad.
- [ ] Expandir un control incumplido: muestra la remediación y los
      hallazgos con archivo y línea en fuente monoespaciada.

## 5. Re-auditoría y conflicto

- [ ] En el detalle, "Volver a auditar": se crea una auditoría nueva del
      mismo proyecto y la página pasa a ella.
- [ ] Mientras está en curso, volver a auditar el mismo proyecto (o enviar
      la misma URL desde el formulario). Aparece "El proyecto ya tiene una
      auditoría en curso".

## 6. Auditoría fallida

- [ ] Auditar `https://github.com/organizacion-inexistente/repo-inexistente`.
      Termina en "Fallida" y el detalle muestra el motivo en un aviso de
      error. En el historial figura con estado "Fallida".

## 7. Auditoría no encontrada

- [ ] Abrir `/auditorias/00000000-0000-4000-8000-000000000000`. Muestra
      "Auditoría no encontrada" con el enlace "Ir al historial".
- [ ] Abrir `/auditorias/abc`: mismo resultado.

## 8. Límite de 5 por minuto

- [ ] Iniciar seis auditorías en menos de un minuto. La sexta muestra
      "Demasiadas solicitudes. Espera un minuto e intenta nuevamente.".
- [ ] Después de un minuto se puede auditar de nuevo.

## 9. Historial

- [ ] Las auditorías aparecen de la más reciente a la más antigua, con
      proyecto, estado, puntaje y fecha.
- [ ] Filtrar por "Completada" y luego por "Fallida": solo se ven las de ese
      estado y la paginación vuelve a la página 1. Un estado sin resultados
      muestra un estado vacío.
- [ ] Con más de 20 auditorías, "Siguiente" y "Anterior" cambian de página y
      el indicador "Página X de Y" se actualiza.

## 10. Panel de cumplimiento

- [ ] "Todos los proyectos": tarjetas de resumen, puntaje por proyecto,
      hallazgos por severidad, controles más incumplidos y auditorías
      recientes.
- [ ] Elegir un proyecto en el filtro: la URL incluye el proyecto, se ve su
      evolución de puntaje y su última auditoría. Recargar mantiene la
      selección.
- [ ] En cada gráfico, "Ver tabla" muestra los mismos valores en una tabla.
- [ ] "Actualizar" recarga los datos sin vaciar la pantalla.

## 11. Tema oscuro

- [ ] Activar el modo oscuro desde el sidebar: toda la app cambia, incluidos
      gráficos, badges y tablas, y los textos se leen con buen contraste.
- [ ] Recargar la página: abre directamente en oscuro, sin destello blanco.
- [ ] El login y el registro respetan el tema elegido.

## 12. Sesión expirada

- [ ] Con la sesión iniciada, alterar el token guardado en `localStorage`
      (clave `dpa_scanner_access_token`) y navegar a otra página. Redirige a
      `/login?sesion=expirada` con el aviso informativo "Tu sesión expiró.
      Inicia sesión nuevamente.", en celeste y no en rojo.
- [ ] Iniciar sesión: llega a `/dashboard` y la URL ya no tiene el
      parámetro.

## 13. Pantallas angostas

Con las herramientas del navegador a 375 px de ancho:

- [ ] El sidebar se reduce a íconos. Al pasar el mouse sobre cada enlace se
      ve su nombre; el nombre del usuario no aparece.
- [ ] El cambio de tema y "Cerrar sesión" funcionan como botones de ícono.
- [ ] Login, panel, historial y detalle no tienen scroll horizontal de
      página, en claro y en oscuro. Las tablas anchas se desplazan dentro de
      su propio contenedor.
- [ ] Desde 768 px el sidebar vuelve a su versión completa.
