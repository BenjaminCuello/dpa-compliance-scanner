// ruleid: dpa-hardcoded-credential
const dbPassword = "Sup3rS3creta";

// ruleid: dpa-hardcoded-credential
const config = { apiKey: "sk_live_ejemplo_123456" };

// ruleid: dpa-hardcoded-credential
this.auth_token = "tok_ejemplo_abcdef";

// ruleid: dpa-hardcoded-credential
let smtpSecret = "correo_clave_123";

// ruleid: dpa-hardcoded-credential
var legacyApiKey = "clave_heredada_456";

// ok: dpa-hardcoded-credential
const pool = new Pool({ password: dbPassword });

// ok: dpa-hardcoded-credential
const password = process.env.DB_PASSWORD;

// ok: dpa-hardcoded-credential
const passwordLabel = "Ingresa tu contraseña";

// ok: dpa-hardcoded-credential
const secret = "";

// ok: dpa-hardcoded-credential
const username = "administrador";
