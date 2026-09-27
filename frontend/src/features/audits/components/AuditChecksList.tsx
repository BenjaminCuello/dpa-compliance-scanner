import { useMemo } from 'react';
import { sortChecks } from '../checks';
import type { AuditCheck } from '../types';
import { AuditCheckItem } from './AuditCheckItem';

interface AuditChecksListProps {
  checks: AuditCheck[];
}

/** Controles de la auditoría: primero los incumplidos, por severidad. */
export function AuditChecksList({ checks }: AuditChecksListProps) {
  const sorted = useMemo(() => sortChecks(checks), [checks]);

  return (
    <section aria-labelledby="controles-titulo" className="space-y-3">
      <h2 id="controles-titulo" className="text-base font-semibold text-text">
        Controles
      </h2>
      <ul aria-label="Controles evaluados" className="space-y-2">
        {sorted.map((check) => (
          <AuditCheckItem key={check.code} check={check} />
        ))}
      </ul>
    </section>
  );
}
