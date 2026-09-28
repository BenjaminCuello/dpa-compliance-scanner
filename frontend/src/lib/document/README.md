# lib/document

Utilidades sobre el documento del navegador.

- `usePageTitle.ts`: hook que fija el título de la pestaña con el formato
  `<título> · DPA Compliance Scanner`. Cada página lo llama con su nombre
  ("Panel", "Auditorías", "Iniciar sesión"…); el detalle usa el nombre del
  proyecto cuando la auditoría ya cargó.
