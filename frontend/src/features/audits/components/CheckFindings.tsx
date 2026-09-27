import type { AuditCheck, AuditFinding } from '../types';

/** Ubicación `ruta:línea`, solo `ruta` si falta la línea, o `null`. */
function formatLocation({ filePath, line }: AuditFinding): string | null {
  if (!filePath) return null;
  return line === null ? filePath : `${filePath}:${line}`;
}

interface CheckFindingsProps {
  id: string;
  check: AuditCheck;
  hidden: boolean;
}

/** Remediación y hallazgos de un control incumplido. */
export function CheckFindings({ id, check, hidden }: CheckFindingsProps) {
  return (
    <div
      id={id}
      hidden={hidden}
      className="space-y-4 border-t border-border bg-bg-soft p-4"
    >
      {check.remediation && (
        <div>
          <h4 className="text-xs font-semibold tracking-wide text-text uppercase">
            Remediación
          </h4>
          <p className="mt-1 text-sm text-text">{check.remediation}</p>
        </div>
      )}

      <div>
        <h4 className="text-xs font-semibold tracking-wide text-text uppercase">
          Hallazgos ({check.findings.length})
        </h4>
        {check.findings.length === 0 ? (
          <p className="mt-1 text-sm text-text-muted">
            Sin hallazgos registrados.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {check.findings.map((finding, index) => {
              const location = formatLocation(finding);
              return (
                <li
                  key={`${location ?? ''}-${index}`}
                  className="rounded border border-border bg-bg p-3"
                >
                  <p className="text-sm text-text">{finding.message}</p>
                  {location && (
                    <p className="mt-1 font-mono text-xs break-all text-text-muted">
                      {location}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
