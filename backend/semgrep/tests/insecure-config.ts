import * as crypto from 'crypto';

// ruleid: dpa-tls-verification-disabled
const agent = new https.Agent({ rejectUnauthorized: false });

// ruleid: dpa-tls-verification-disabled
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// ok: dpa-tls-verification-disabled
const safeAgent = new https.Agent({ rejectUnauthorized: true });

// ruleid: dpa-cors-any-origin
app.use(cors({ origin: "*" }));

// ruleid: dpa-cors-any-origin
app.enableCors({ origin: "*", credentials: false });

// ok: dpa-cors-any-origin
app.enableCors({ origin: ["https://app.ejemplo.cl"] });

// ruleid: dpa-insecure-session-cookie
res.cookie("session", token, { httpOnly: false, secure: true });

// ok: dpa-insecure-session-cookie
res.cookie("session", token, { httpOnly: true, secure: true });

// ruleid: dpa-weak-hash-algorithm
const digest = crypto.createHash("md5").update(password).digest("hex");

// ok: dpa-weak-hash-algorithm
const integrity = crypto.createHash("sha256").update(file).digest("hex");
