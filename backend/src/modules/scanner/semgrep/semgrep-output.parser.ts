import { basename, isAbsolute, relative } from 'node:path';
import { CheckSeverity } from '../../audits/enums';
import { ScanFailedError } from '../errors/scanner.errors';
import { ScanFinding, ScanIssue } from '../interfaces/scan-report.interface';
import { SemgrepOutput, SemgrepResult } from './semgrep-output.interface';

const SEVERITY_BY_ENGINE_LEVEL: Record<string, CheckSeverity> = {
  ERROR: CheckSeverity.HIGH,
  WARNING: CheckSeverity.MEDIUM,
  INFO: CheckSeverity.LOW,
};

const KNOWN_SEVERITIES = new Set<string>(Object.values(CheckSeverity));

/**
 * Convierte el texto emitido por Semgrep en un objeto validado.
 * @throws ScanFailedError si la salida no es JSON o no tiene la forma esperada.
 */
export function parseSemgrepOutput(raw: string): SemgrepOutput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new ScanFailedError(
      'La salida del motor de escaneo no es JSON válido',
      {
        cause: error,
      },
    );
  }

  const output = parsed as Partial<SemgrepOutput>;

  if (!Array.isArray(output?.results) || !Array.isArray(output?.errors)) {
    throw new ScanFailedError('La salida del motor de escaneo está incompleta');
  }

  return output as SemgrepOutput;
}

/**
 * Semgrep antepone la ruta de la carpeta de reglas al identificador
 * (por ejemplo `semgrep.rules.dpa-private-key`); se conserva solo el nombre.
 */
export function normalizeRuleId(checkId: string): string {
  return checkId.split('.').pop() ?? checkId;
}

function resolveSeverity(result: SemgrepResult): CheckSeverity {
  const declared = readMetadataText(result, 'dpa-severity');

  if (KNOWN_SEVERITIES.has(declared)) {
    return declared as CheckSeverity;
  }

  return (
    SEVERITY_BY_ENGINE_LEVEL[result.extra.severity] ?? CheckSeverity.MEDIUM
  );
}

/**
 * Expresa la ruta respecto de la raíz del proyecto. Si por algún motivo queda
 * fuera de ella, se conserva solo el nombre del archivo para no exponer rutas
 * internas del servidor.
 */
function toProjectPath(targetDir: string, path: string): string {
  const fromRoot = relative(targetDir, path);

  return fromRoot.startsWith('..') || isAbsolute(fromRoot)
    ? basename(path)
    : fromRoot;
}

function readMetadataText(result: SemgrepResult, key: string): string {
  const value = result.extra.metadata?.[key];
  return typeof value === 'string' ? value : '';
}

/**
 * Traduce los resultados de Semgrep a hallazgos del dominio.
 * El fragmento de código (`extra.lines`) se descarta a propósito: en los
 * hallazgos de secretos contiene el valor expuesto.
 * @param output Salida ya validada de Semgrep.
 * @param targetDir Raíz del proyecto, para expresar rutas relativas.
 */
export function toFindings(
  output: SemgrepOutput,
  targetDir: string,
): ScanFinding[] {
  const seen = new Set<string>();

  return (
    output.results
      .map((result) => ({
        checkCode: readMetadataText(result, 'dpa-code'),
        ruleId: normalizeRuleId(result.check_id),
        severity: resolveSeverity(result),
        message: result.extra.message.trim(),
        filePath: toProjectPath(targetDir, result.path),
        line: result.start.line,
        endLine: result.end.line,
      }))
      // Varias variantes de una misma regla pueden coincidir sobre la misma línea.
      .filter((finding) => {
        const key = `${finding.ruleId}|${finding.filePath}|${finding.line}`;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      })
  );
}

/** Extrae las advertencias que Semgrep reportó sin interrumpir el escaneo. */
export function toIssues(
  output: SemgrepOutput,
  targetDir: string,
): ScanIssue[] {
  return output.errors.map((error) => ({
    level: error.level ?? 'error',
    message: error.message ?? 'Error sin detalle informado por el motor',
    ...(error.path ? { filePath: toProjectPath(targetDir, error.path) } : {}),
  }));
}
