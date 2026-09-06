# features/auth

Autenticación de usuarios: registro, inicio de sesión y sesión actual.

- `types.ts`: tipos que reflejan los DTOs del backend (`LoginDto`,
  `RegisterDto`, `AuthResponseDto`, `AuthenticatedUserDto`).
- `authService.ts`: llamadas HTTP a `/auth/register`, `/auth/login` y
  `/auth/profile` usando el cliente de `src/lib/http`.
- `authContext.ts` / `AuthProvider.tsx`: contexto de React con el usuario
  autenticado, `isLoading` (mientras se valida el token guardado contra
  `/auth/profile`) y las acciones `login`, `register` y `logout`.
- `useAuth.ts`: hook para consumir el contexto de autenticación.

## Decisión de diseño

Al montar la aplicación, si hay un token guardado, `AuthProvider` llama a
`GET /auth/profile` para confirmar que sigue siendo válido antes de
considerar a la persona autenticada. Si el backend responde 401, el token
se descarta. Esto evita que una ruta protegida se muestre brevemente con un
token vencido.
