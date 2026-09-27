import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatPercent } from '../../../lib/format/number';
import { COMPLIANCE_THRESHOLDS } from '../../audits/compliance';
import type { ProjectScore } from '../types';
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
  PERCENT_TICKS,
  percentTick,
  referenceProps,
  X_AXIS_HEIGHT,
} from './chartStyles';

/** Margen superior: deja lugar a la etiqueta "Bueno". */
const MARGIN = { top: 20, right: 56, bottom: 0, left: 0 };
const NAME_MAX_CHARS = 18;

interface ProjectTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
  names: Map<string, string>;
  fill: string;
}

/** Nombre del proyecto en el eje, truncado, con el nombre completo en `title`. */
function ProjectTick({ x = 0, y = 0, payload, names, fill }: ProjectTickProps) {
  const name = names.get(payload?.value ?? '') ?? '';
  const short =
    name.length > NAME_MAX_CHARS
      ? `${name.slice(0, NAME_MAX_CHARS - 1)}…`
      : name;

  return (
    <text x={x} y={y} dy={4} textAnchor="end" fill={fill} fontSize={12}>
      <title>{name}</title>
      {short}
    </text>
  );
}

interface ProjectScoresChartProps {
  scores: ProjectScore[];
  onSelectProject: (projectId: string) => void;
}

/** Barras horizontales con el último puntaje de cada proyecto. */
export function ProjectScoresChart({
  scores,
  onSelectProject,
}: ProjectScoresChartProps) {
  const colors = useChartColors();
  const names = new Map(scores.map((score) => [score.projectId, score.name]));
  const axis = axisProps(colors);

  return (
    <div className={CHART_WRAPPER}>
      <ResponsiveContainer
        width="100%"
        height={barChartHeight(scores.length, MARGIN.top)}
      >
        <BarChart data={scores} layout="vertical" margin={MARGIN}>
          <CartesianGrid horizontal={false} {...gridProps(colors)} />
          <XAxis
            type="number"
            domain={[0, 100]}
            ticks={PERCENT_TICKS}
            tickFormatter={percentTick}
            height={X_AXIS_HEIGHT}
            {...axis}
          />
          <YAxis
            type="category"
            dataKey="projectId"
            width={136}
            {...axis}
            tick={<ProjectTick names={names} fill={colors.textMuted} />}
          />
          <Tooltip
            cursor={{ fill: colors.border, fillOpacity: 0.4 }}
            isAnimationActive={false}
            content={
              <ChartTooltip
                valueLabel="Puntaje"
                formatValue={formatPercent}
                formatLabel={(id) => names.get(id) ?? id}
              />
            }
          />
          <ReferenceLine
            x={COMPLIANCE_THRESHOLDS.good}
            {...referenceProps(colors)}
            label={{
              value: 'Bueno',
              position: 'top',
              fill: colors.textMuted,
              fontSize: 12,
            }}
          />
          <Bar
            dataKey="score"
            fill={colors.primary}
            barSize={BAR_SIZE}
            radius={BAR_RADIUS}
            shape={BarShape}
            cursor="pointer"
            isAnimationActive={false}
            onClick={(item) => onSelectProject(item.payload.projectId)}
          >
            <LabelList
              dataKey="score"
              content={
                <ValueLabel
                  format={formatPercent}
                  textColor={colors.text}
                  background={colors.bg}
                />
              }
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
