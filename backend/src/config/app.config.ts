import { registerAs } from '@nestjs/config';

/** Configuración transversal de la aplicación (namespace "app"). */
export default registerAs('app', () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  trustProxyHops: parseInt(process.env.TRUST_PROXY_HOPS ?? '0', 10),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '60', 10),
  },
}));
