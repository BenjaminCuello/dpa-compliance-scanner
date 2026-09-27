import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHECK_SEVERITY_LABELS } from '../../audits/labels';
import type { SeverityCount } from '../types';
import { useChartColors } from '../useChartColors';
import { BarShape } from './BarShape';
import { ChartTooltip } from './ChartTooltip';
import { ValueLabel } from './ValueLabel';
import {
  axisProps,
  CHART_WRAPPER,
  BAR_RADIUS,
  BAR_SIZE,
  barChartHeight,
  gridProps,
  X_AXIS_HEIGHT,
} from './chartStyles';

const MARGIN = { top: 8, right: 40, bottom: 0, left: 0 };

function formatCount(value: number): string {
  return String(value);
}

/** Hallazgos por severidad, de crítica a baja, con la rampa `chart-severity-*`. */
export function SeverityChart({ counts }: { counts: SeverityCount[] }) {
  const colors = useChartColors();
  const axis = axisProps(colors);
  const data = counts.map((item) => ({
    ...item,
    label: CHECK_SEVERITY_LABELS[item.severity],
  }));

  return (
    <div className={CHART_WRAPPER}>
      <ResponsiveContainer
        width="100%"
        height={barChartHeight(data.length, MARGIN.top)}
      >
        <BarChart data={data} layout="vertical" margin={MARGIN}>
          <CartesianGrid horizontal={false} {...gridProps(colors)} />
          <XAxis
            type="number"
            allowDecimals={false}
            height={X_AXIS_HEIGHT}
            {...axis}
          />
          <YAxis type="category" dataKey="label" width={64} {...axis} />
          <Tooltip
            cursor={{ fill: colors.border, fillOpacity: 0.4 }}
            isAnimationActive={false}
            content={
              <ChartTooltip valueLabel="Hallazgos" formatValue={formatCount} />
            }
          />
          <Bar
            dataKey="count"
            barSize={BAR_SIZE}
            radius={BAR_RADIUS}
            shape={BarShape}
            isAnimationActive={false}
          >
            {data.map((item) => (
              <Cell key={item.severity} fill={colors.severity[item.severity]} />
            ))}
            <LabelList
              dataKey="count"
              content={
                <ValueLabel textColor={colors.text} background={colors.bg} />
              }
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
