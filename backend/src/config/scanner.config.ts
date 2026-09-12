import { registerAs } from '@nestjs/config';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

/** Configuración del motor de escaneo (namespace "scanner"). */
export default registerAs('scanner', () => ({
  semgrepBin: process.env.SEMGREP_BIN ?? 'semgrep',
  rulesDir: resolve(process.env.SEMGREP_RULES_DIR ?? 'semgrep/rules'),
  workspaceDir: resolve(
    process.env.SCANNER_WORKSPACE_DIR ?? join(tmpdir(), 'dpa-scanner'),
  ),
  timeoutMs: parseInt(process.env.SEMGREP_TIMEOUT_MS ?? '300000', 10),
}));
