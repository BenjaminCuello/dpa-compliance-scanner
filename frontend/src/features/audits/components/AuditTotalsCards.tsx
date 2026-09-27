import { CHECK_SEVERITY_LABELS, SEVERITY_ORDER } from '../labels';
import type { AuditTotals, CheckSeverity } from '../types';

/** Color de texto por severidad, de los tokens `severity-*`. */
const SEVERITY_TEXT: Record<CheckSeverity, string> = {
  critical: 'text-severity-critical',
  high: 'text-severity-high',
  medium: 'text-severity-medium',
  low: 'text-severity-low',
};

const cardClasses = 'rounded-md border border-border bg-bg p-4';

interface AuditTotalsCardsProps {
  totals: AuditTotals;
}

/** Totales de una auditoría completada y hallazgos por severidad. */
export function AuditTotalsCards({ totals }: AuditTotalsCardsProps) {
  const cards = [
    {
      label: 'Controles evaluados',
      value: totals.totalChecks,
      tone: 'text-text',
    },
    {
      label: 'Aprobados',
      value: totals.passedChecks,
      tone: 'text-success-text',
    },
    {
      label: 'Incumplidos',
      value: totals.failedChecks,
      tone: 'text-critical-text',
    },
    {
      label: 'Hallazgos totales',
      value: totals.totalFindings,
      tone: 'text-text',
    },
  ];

  return (
    <section aria-labelledby="totales-titulo" className="space-y-4">
      <h2 id="totales-titulo" className="sr-only">
        Resumen
      </h2>
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, tone }) => (
          <div key={label} className={cardClasses}>
            <dt className="text-xs text-text-muted">{label}</dt>
            <dd className={`mt-1 text-2xl font-semibold tabular-nums ${tone}`}>
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className={cardClasses}>
        <h3 className="text-sm font-semibold text-text">
          Hallazgos por severidad
        </h3>
        <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SEVERITY_ORDER.map((severity) => (
            <div key={severity}>
              <dt className="text-xs text-text-muted">
                {CHECK_SEVERITY_LABELS[severity]}
              </dt>
              <dd
                className={`mt-1 text-xl font-semibold tabular-nums ${SEVERITY_TEXT[severity]}`}
              >
                {totals.findingsBySeverity[severity]}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
