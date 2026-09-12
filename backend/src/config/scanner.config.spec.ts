import { tmpdir } from 'node:os';
import { isAbsolute, join } from 'node:path';
import scannerConfig from './scanner.config';

describe('scannerConfig', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('resuelve rutas absolutas con valores por defecto', () => {
    process.env = { ...originalEnv };
    delete process.env.SEMGREP_RULES_DIR;
    delete process.env.SCANNER_WORKSPACE_DIR;

    const config = scannerConfig();

    expect(isAbsolute(config.rulesDir)).toBe(true);
    expect(config.rulesDir.endsWith(join('semgrep', 'rules'))).toBe(true);
    expect(config.workspaceDir).toBe(join(tmpdir(), 'dpa-scanner'));
    expect(config.semgrepBin).toBe('semgrep');
  });

  it('respeta los valores entregados por el entorno', () => {
    process.env = {
      ...originalEnv,
      SEMGREP_BIN: '/opt/semgrep/bin/semgrep',
      SCANNER_WORKSPACE_DIR: '/srv/escaneos',
      SEMGREP_TIMEOUT_MS: '60000',
    };

    const config = scannerConfig();

    expect(config.semgrepBin).toBe('/opt/semgrep/bin/semgrep');
    expect(config.workspaceDir).toBe('/srv/escaneos');
    expect(config.timeoutMs).toBe(60000);
  });
});
