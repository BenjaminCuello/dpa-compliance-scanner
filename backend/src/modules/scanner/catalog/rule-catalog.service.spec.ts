import { ConfigService } from '@nestjs/config';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { InvalidRuleCatalogError } from '../errors/scanner.errors';
import { RuleCatalogService } from './rule-catalog.service';

const catalogFor = (rulesDir: string) =>
  new RuleCatalogService({ get: () => rulesDir } as unknown as ConfigService);

describe('RuleCatalogService', () => {
  describe('con las reglas del proyecto', () => {
    const service = catalogFor(resolve(__dirname, '../../../../semgrep/rules'));

    it('carga los controles de secretos y de configuración', async () => {
      const checks = await service.load();

      expect(checks.length).toBeGreaterThanOrEqual(9);
      expect(new Set(checks.map((check) => check.category))).toEqual(
        new Set(['secrets', 'configuration']),
      );
    });

    it('agrupa en un solo control las reglas que comparten código', async () => {
      await service.onModuleInit();
      const credenciales = service
        .getChecks()
        .find((check) => check.code === 'DPA-SEC-001');

      expect(credenciales?.ruleIds).toEqual([
        'dpa-hardcoded-credential',
        'dpa-hardcoded-credential-python',
      ]);
    });

    it('asigna códigos únicos y ordenados', async () => {
      const codes = (await service.load()).map((check) => check.code);

      expect(new Set(codes).size).toBe(codes.length);
      expect([...codes].sort()).toEqual(codes);
    });
  });

  describe('con reglas inválidas', () => {
    let dir: string;

    beforeEach(async () => {
      dir = await mkdtemp(join(tmpdir(), 'reglas-'));
    });

    afterEach(() => rm(dir, { recursive: true, force: true }));

    it('rechaza una regla sin la metadata obligatoria', async () => {
      await writeFile(join(dir, 'mala.yml'), 'rules:\n  - id: sin-metadata\n');

      await expect(catalogFor(dir).load()).rejects.toThrow('faltan dpa-code');
    });

    it('rechaza una severidad fuera del dominio', async () => {
      await writeFile(
        join(dir, 'mala.yml'),
        [
          'rules:',
          '  - id: regla',
          '    metadata:',
          '      dpa-code: DPA-X-001',
          '      title: Titulo',
          '      category: secrets',
          '      dpa-severity: extrema',
          '      remediation: Corregir',
        ].join('\n'),
      );

      await expect(catalogFor(dir).load()).rejects.toBeInstanceOf(
        InvalidRuleCatalogError,
      );
    });

    it('rechaza una carpeta sin reglas', async () => {
      await writeFile(join(dir, 'notas.txt'), 'sin reglas');

      await expect(catalogFor(dir).load()).rejects.toThrow(
        'No se encontraron reglas',
      );
    });
  });
});
