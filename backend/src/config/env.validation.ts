import * as Joi from 'joi';

/**
 * Esquema de validación de las variables de entorno: si alguna obligatoria falta
 * o tiene un formato inválido, la aplicación no inicia.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().default('api'),
  CORS_ORIGINS: Joi.string().default('http://localhost:5173'),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
  DB_MIGRATIONS_RUN: Joi.boolean().default(false),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  BCRYPT_ROUNDS: Joi.number().integer().min(10).max(15).default(12),

  SEMGREP_BIN: Joi.string().default('semgrep'),
  SEMGREP_RULES_DIR: Joi.string().optional(),
  SEMGREP_TIMEOUT_MS: Joi.number().integer().min(1000).default(300000),
  SCANNER_WORKSPACE_DIR: Joi.string().optional(),

  AUDIT_ALLOWED_GIT_HOSTS: Joi.string().default(
    'github.com,gitlab.com,bitbucket.org',
  ),
  AUDIT_CLONE_TIMEOUT_MS: Joi.number().integer().min(5000).default(120000),
  AUDIT_MAX_REPOSITORY_MB: Joi.number().integer().min(1).max(2000).default(200),
  AUDIT_MAX_CONCURRENT: Joi.number().integer().min(1).max(10).default(2),

  THROTTLE_TTL: Joi.number().positive().default(60),
  THROTTLE_LIMIT: Joi.number().positive().default(60),
});
