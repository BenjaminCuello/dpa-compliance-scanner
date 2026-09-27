interface ChartTooltipProps {
  /** Los inyecta Recharts, con el mouse o con el foco del teclado. */
  active?: boolean;
  payload?: ReadonlyArray<{ value?: unknown }>;
  label?: string | number;
  /** Nombre del valor, p. ej. "Puntaje". */
  valueLabel: string;
  formatValue: (value: number) => string;
  formatLabel?: (label: string) => string;
}

/** Tooltip del panel en español, con los colores de los tokens. */
export function ChartTooltip({
  active,
  payload,
  label,
  valueLabel,
  formatValue,
  formatLabel = (value) => value,
}: ChartTooltipProps) {
  const value = payload?.[0]?.value;
  if (!active || typeof value !== 'number') return null;

  return (
    <div className="rounded-md border border-border bg-bg px-3 py-2 text-xs">
      <p className="font-medium text-text">{formatLabel(String(label))}</p>
      <p className="mt-0.5 text-text-muted">
        {valueLabel}:{' '}
        <span className="font-medium text-text tabular-nums">
          {formatValue(value)}
        </span>
      </p>
    </div>
  );
}
