/** Ancho aproximado de un carácter de 12 px, para el fondo de la etiqueta. */
const CHAR_WIDTH = 7;
/** Separación entre el final de la barra y la etiqueta. */
const OFFSET = 6;

interface ValueLabelProps {
  /** Los inyecta `LabelList`: el rectángulo de la barra y su valor. */
  viewBox?: { x?: number; y?: number; width?: number; height?: number };
  value?: unknown;
  format?: (value: number) => string;
  /** Color del texto. No se llama `fill` porque `Cell` lo reemplazaría. */
  textColor: string;
  /** Color del fondo: tapa la grilla y la línea de referencia. */
  background: string;
}

/** Valor al final de una barra horizontal, sobre un fondo del color del panel. */
export function ValueLabel({
  viewBox = {},
  value,
  format = String,
  textColor,
  background,
}: ValueLabelProps) {
  const { x = 0, y = 0, width = 0, height = 0 } = viewBox;
  const text = format(Number(value));
  const left = x + width + OFFSET;
  const middle = y + height / 2;

  return (
    <g>
      <rect
        x={left - 2}
        y={middle - 9}
        width={text.length * CHAR_WIDTH + 4}
        height={18}
        fill={background}
      />
      <text x={left} y={middle} dy={4} fill={textColor} fontSize={12}>
        {text}
      </text>
    </g>
  );
}
