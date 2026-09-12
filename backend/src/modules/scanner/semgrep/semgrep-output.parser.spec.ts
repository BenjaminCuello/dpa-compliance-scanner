import { CheckSeverity } from '../../audits/enums';
import { ScanFailedError } from '../errors/scanner.errors';
import {
  normalizeRuleId,
  parseSemgrepOutput,
  toFindings,
  toIssues,
} from './semgrep-output.parser';
import { SemgrepOutput } from './semgrep-output.interface';

describe('semgrep-output.parser', () => {
  const output: SemgrepOutput = {
    version: '1.176.1',
    results: [
      {
        check_id: 'app.semgrep.rules.dpa-hardcoded-credential',
        path: '/workspace/proyecto/src/db.ts',
        start: { line: 4, col: 7 },
        end: { line: 4, col: 40 },
        extra: {
          message: '  La credencial está escrita en el código.  ',
          severity: 'ERROR',
          metadata: { 'dpa-code': 'DPA-SEC-001', 'dpa-severity': 'critical' },
          lines: 'const dbPassword = "Sup3rS3creta";',
        },
      },
    ],
    errors: [
      {
        level: 'warn',
        message: 'Archivo omitido',
        path: '/workspace/proyecto/big.min.js',
      },
    ],
  };

  describe('parseSemgrepOutput', () => {
    it('acepta una salida con resultados y errores', () => {
      expect(parseSemgrepOutput(JSON.stringify(output)).version).toBe(
        '1.176.1',
      );
    });

    it('rechaza texto que no es JSON', () => {
      expect(() =>
        parseSemgrepOutput('Traceback (most recent call last)'),
      ).toThrow(ScanFailedError);
    });

    it('rechaza un JSON sin la estructura esperada', () => {
      expect(() => parseSemgrepOutput('{"version":"1.0"}')).toThrow(
        ScanFailedError,
      );
    });
  });

  it('quita el prefijo de carpeta del identificador de la regla', () => {
    expect(normalizeRuleId('app.semgrep.rules.dpa-private-key')).toBe(
      'dpa-private-key',
    );
    expect(normalizeRuleId('dpa-private-key')).toBe('dpa-private-key');
  });

  describe('toFindings', () => {
    it('traduce el resultado con rutas relativas y la severidad del catálogo', () => {
      const [finding] = toFindings(output, '/workspace/proyecto');

      expect(finding).toEqual({
        checkCode: 'DPA-SEC-001',
        ruleId: 'dpa-hardcoded-credential',
        severity: CheckSeverity.CRITICAL,
        message: 'La credencial está escrita en el código.',
        filePath: 'src/db.ts',
        line: 4,
        endLine: 4,
      });
    });

    it('nunca incluye el fragmento de código que contiene el secreto', () => {
      const serialized = JSON.stringify(
        toFindings(output, '/workspace/proyecto'),
      );

      expect(serialized).not.toContain('Sup3rS3creta');
    });

    it('reporta una sola vez la misma regla sobre la misma línea', () => {
      const duplicado: SemgrepOutput = {
        ...output,
        results: [
          output.results[0],
          { ...output.results[0], start: { line: 4, col: 1 } },
        ],
      };

      expect(toFindings(duplicado, '/workspace/proyecto')).toHaveLength(1);
    });

    it('usa el nivel de Semgrep cuando la regla no declara severidad', () => {
      const sinMetadata: SemgrepOutput = {
        ...output,
        results: [
          {
            ...output.results[0],
            extra: { message: 'x', severity: 'WARNING' },
          },
        ],
      };

      expect(toFindings(sinMetadata, '/workspace/proyecto')[0].severity).toBe(
        CheckSeverity.MEDIUM,
      );
    });
  });

  it('no expone rutas del servidor ajenas al proyecto', () => {
    const fuera: SemgrepOutput = {
      ...output,
      results: [{ ...output.results[0], path: '/etc/app/credenciales.env' }],
    };

    expect(toFindings(fuera, '/workspace/proyecto')[0].filePath).toBe(
      'credenciales.env',
    );
  });

  it('expone las advertencias del motor con rutas relativas', () => {
    expect(toIssues(output, '/workspace/proyecto')).toEqual([
      { level: 'warn', message: 'Archivo omitido', filePath: 'big.min.js' },
    ]);
  });
});
