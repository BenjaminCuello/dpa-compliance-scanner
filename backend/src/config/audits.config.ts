import { registerAs } from '@nestjs/config';

const DEFAULT_GIT_HOSTS = 'github.com,gitlab.com,bitbucket.org';

/** Configuración de la ejecución de auditorías (namespace "audits"). */
export default registerAs('audits', () => ({
  allowedGitHosts: (process.env.AUDIT_ALLOWED_GIT_HOSTS ?? DEFAULT_GIT_HOSTS)
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean),
  cloneTimeoutMs: parseInt(process.env.AUDIT_CLONE_TIMEOUT_MS ?? '120000', 10),
  maxRepositoryMb: parseInt(process.env.AUDIT_MAX_REPOSITORY_MB ?? '200', 10),
  maxConcurrent: parseInt(process.env.AUDIT_MAX_CONCURRENT ?? '2', 10),
}));
