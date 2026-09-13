# auth

Registro de cuentas, inicio de sesión y protección de los endpoints.

## Endpoints

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/auth/register` | público | Crea una cuenta y devuelve un token. |
| POST | `/auth/login` | público | Valida credenciales y devuelve un token. |
| GET | `/auth/profile` | con token | Datos del usuario de la sesión actual. |

## Archivos

- `auth.service.ts`: cifra la contraseña con bcrypt al registrar, verifica las
  credenciales al iniciar sesión y arma la respuesta con el token.
- `strategies/jwt.strategy.ts`: valida el token del encabezado `Authorization` y
  resuelve el usuario, rechazando cuentas eliminadas o desactivadas.
- `guards/jwt-auth.guard.ts`: exige token en toda la API. Está registrado como
  guard global en `app.module.ts`.
- `decorators/public.decorator.ts`: `@Public()` libera un endpoint del guard. Lo
  usan el registro, el inicio de sesión y `/health`.
- `decorators/current-user.decorator.ts`: `@CurrentUser()` entrega el usuario que
  el guard dejó en la petición.
- `dto/`: contratos de entrada y salida, validados con class-validator y
  publicados en Swagger.

## Decisiones

- Los endpoints quedan protegidos por omisión: agregar uno nuevo no exige
  acordarse de ponerle el guard, sino lo contrario, marcarlo como público.
- El inicio de sesión responde el mismo mensaje ante un correo inexistente y ante
  una contraseña incorrecta, para no revelar qué cuentas están registradas. Por
  la misma razón, bcrypt se ejecuta en ambos casos: si el correo no existe se
  compara contra un hash de relleno, así la respuesta tarda lo mismo y el tiempo
  tampoco delata cuentas.
- El token lleva solo el identificador y el correo. Los datos del usuario se
  leen de la base en cada petición, así una cuenta desactivada deja de tener
  acceso sin esperar a que expire el token.
- La contraseña exige diez caracteres con minúscula, mayúscula y número, y se
  limita a 72 porque es el máximo que considera bcrypt.

## Uso del token

```
Authorization: Bearer <accessToken>
```

En Swagger, el botón *Authorize* pide el token y lo aplica a los endpoints
protegidos.
