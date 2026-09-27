import type { ReactNode } from 'react';

export interface StatCardItem {
  label: string;
  value: ReactNode;
  /** Texto secundario bajo la cifra. */
  detail?: ReactNode;
}

/** Indicadores del panel, con el patrón de `AuditTotalsCards`. */
export function StatCards({ items }: { items: StatCardItem[] }) {
  return (
    <section aria-label="Indicadores">
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map(({ label, value, detail }) => (
          <div
            key={label}
            className="rounded-md border border-border bg-bg p-4"
          >
            <dt className="text-xs text-text-muted">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold text-text">{value}</dd>
            {detail && (
              <dd className="mt-1 text-xs text-text-muted">{detail}</dd>
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}
