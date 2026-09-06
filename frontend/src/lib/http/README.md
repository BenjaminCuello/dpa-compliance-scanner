# lib/http

Cliente HTTP compartido para hablar con la API del backend.

- `httpClient.ts`: instancia de Axios configurada con `VITE_API_URL`. Un
  interceptor de request agrega el token JWT en el header `Authorization`
  cuando existe; un interceptor de response detecta sesiones expiradas
  (401 en un endpoint protegido) y redirige a `/login` limpiando el token.
- `tokenStorage.ts`: guarda, lee y elimina el token JWT en `localStorage`.
- `sessionExpiry.ts`: decide si un error 401 corresponde a una sesión
  expirada o a un login/registro con credenciales inválidas.
- `apiError.ts`: extrae un mensaje de error legible desde el formato de
  respuesta de error del backend (`{ statusCode, path, timestamp, message }`).

## Decisión de diseño

Se usa **Axios** en vez de `fetch` por su soporte nativo de interceptores,
que simplifica adjuntar el token y reaccionar ante un 401 sin repetir
lógica en cada llamada. El token se guarda en `localStorage` (no en una
cookie) porque el backend no emite cookies de sesión; queda pendiente
evaluar `httpOnly` cookies si en el futuro se prioriza mitigar XSS por sobre
la simplicidad actual.
