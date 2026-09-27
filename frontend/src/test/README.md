# test

Configuración compartida para las pruebas con Vitest.

- `setup.ts`: registra los matchers de `@testing-library/jest-dom` antes de
  correr las pruebas (configurado como `setupFiles` en `vite.config.ts`).

`vite.config.ts` fija `testTimeout` en 15 s: con toda la suite en paralelo,
las pruebas que escriben con `user.type` se acercan al límite por defecto de
5 s aunque solas tarden menos de 1 s.
