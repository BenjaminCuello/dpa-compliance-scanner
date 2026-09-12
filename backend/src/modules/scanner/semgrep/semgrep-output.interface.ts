/** Posición dentro de un archivo según el formato de Semgrep. */
interface SemgrepPosition {
  line: number;
  col: number;
}

export interface SemgrepResult {
  check_id: string;
  path: string;
  start: SemgrepPosition;
  end: SemgrepPosition;
  extra: {
    message: string;
    severity: string;
    metadata?: Record<string, unknown>;
    /** Línea de código afectada. Puede contener el secreto detectado. */
    lines?: string;
  };
}

export interface SemgrepError {
  level?: string;
  message?: string;
  path?: string;
}

/** Salida de `semgrep scan --json`, reducida a los campos que se consumen. */
export interface SemgrepOutput {
  version: string;
  results: SemgrepResult[];
  errors: SemgrepError[];
  paths?: { scanned?: string[] };
}
