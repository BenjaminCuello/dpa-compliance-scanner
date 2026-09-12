# semgrep

Reglas de escaneo y sus casos de prueba.

- `rules/`: reglas que ejecuta el escáner. Se copian a la imagen del backend.
- `tests/`: archivos anotados que verifican cada regla. No se incluyen en la
  imagen ni en la compilación.

## Catálogo de controles

| Código | Control | Severidad | Reglas |
|--------|---------|-----------|--------|
| DPA-SEC-001 | Credenciales escritas en el código | crítica | `dpa-hardcoded-credential`, `dpa-hardcoded-credential-python` |
| DPA-SEC-002 | Claves de acceso a servicios en la nube | crítica | `dpa-cloud-access-key` |
| DPA-SEC-003 | Claves privadas en el repositorio | crítica | `dpa-private-key` |
| DPA-SEC-004 | Credenciales de base de datos en cadenas de conexión | alta | `dpa-connection-string-credentials` |
| DPA-CFG-001 | Verificación de certificados TLS desactivada | alta | `dpa-tls-verification-disabled`, `dpa-tls-verification-disabled-python` |
| DPA-CFG-002 | CORS abierto a cualquier origen | media | `dpa-cors-any-origin` |
| DPA-CFG-003 | Cookies de sesión sin atributos de seguridad | media | `dpa-insecure-session-cookie` |
| DPA-CFG-004 | Algoritmos de hash débiles | alta | `dpa-weak-hash-algorithm`, `dpa-weak-hash-algorithm-python` |
| DPA-CFG-005 | Modo de depuración activo | media | `dpa-debug-mode-enabled` |

Lenguajes cubiertos: JavaScript, TypeScript y Python. Las reglas de claves y
cadenas de conexión son genéricas y aplican a cualquier archivo de texto, incluidos
`.env` y archivos de configuración.

## Agregar una regla

Cada regla necesita esta metadata; sin ella la aplicación no inicia:

```yaml
metadata:
  dpa-code: DPA-CFG-006
  title: Título del control
  category: configuration     # secrets | configuration
  dpa-severity: high          # low | medium | high | critical
  remediation: Qué hacer para corregirlo.
```

Reglas con el mismo `dpa-code` forman un solo control; se usa para cubrir el
mismo problema en varios lenguajes.

Los identificadores no deben contener puntos: Semgrep les antepone la ruta de la
carpeta separada por puntos y el escáner se queda con el último segmento.

## Probar las reglas

Los archivos de `tests/` tienen el mismo nombre que el archivo de reglas que
prueban. Cada caso se anota en la línea anterior:

```ts
// ruleid: dpa-hardcoded-credential
const dbPassword = "valor";

// ok: dpa-hardcoded-credential
const dbPassword = process.env.DB_PASSWORD;
```

Con Semgrep disponible (por ejemplo, dentro del contenedor de desarrollo):

```bash
npm run test:rules
```

Un archivo de pruebas se evalúa con todas las reglas del archivo del mismo
nombre, por eso las reglas genéricas viven aparte en `exposed-keys.yml`: si
compartieran archivo con las de TypeScript, estas intentarían interpretar los
casos de texto plano.
