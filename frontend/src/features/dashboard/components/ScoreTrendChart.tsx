import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatDate, formatDateTime } from '../../../lib/format/date';
import { formatPercent } from '../../../lib/format/number';
import { COMPLIANCE_THRESHOLDS } from '../../audits/compliance';
import type { ScoreTrendPoint } from '../types';
import { useChartColors } from '../useChartColors';
import { ChartTooltip } from './ChartTooltip';
import {
  axisProps,
  CHART_WRAPPER,
  gridProps,
  LINE_CHART_HEIGHT,
  PERCENT_TICKS,
  percentTick,
  referenceProps,
  X_AXIS_HEIGHT,
} from './chartStyles';

/** Margen derecho: deja lugar a la etiqueta "Bueno". */
const MARGIN = { top: 8, right: 48, bottom: 0, left: 0 };

/** Evolución del puntaje: línea de 2 px y puntos de 8 px con anillo del fondo. */
export function ScoreTrendChart({ points }: { points: ScoreTrendPoint[] }) {
  const colors = useChartColors();
  const axis = axisProps(colors);
  const dot = {
    r: 4,
    fill: colors.primary,
    stroke: colors.bg,
    strokeWidth: 2,
  };

  return (
    <div className={CHART_WRAPPER}>
      <ResponsiveContainer width="100%" height={LINE_CHART_HEIGHT}>
        <LineChart data={points} margin={MARGIN}>
          <CartesianGrid vertical={false} {...gridProps(colors)} />
          <XAxis
            dataKey="finishedAt"
            tickFormatter={(value: string) => formatDate(value)}
            height={X_AXIS_HEIGHT}
            padding={{ left: 40, right: 40 }}
            minTickGap={24}
            {...axis}
          />
          <YAxis
            domain={[0, 100]}
            ticks={PERCENT_TICKS}
            tickFormatter={percentTick}
            width={44}
            {...axis}
          />
          <Tooltip
            cursor={{ stroke: colors.border, strokeWidth: 1 }}
            isAnimationActive={false}
            content={
              <ChartTooltip
                valueLabel="Puntaje"
                formatValue={formatPercent}
                formatLabel={formatDateTime}
              />
            }
          />
          <ReferenceLine
            y={COMPLIANCE_THRESHOLDS.good}
            {...referenceProps(colors)}
            label={{
              value: 'Bueno',
              position: 'right',
              fill: colors.textMuted,
              fontSize: 12,
            }}
          />
          <Line
            type="linear"
            dataKey="score"
            stroke={colors.primary}
            strokeWidth={2}
            dot={dot}
            activeDot={{ ...dot, r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
