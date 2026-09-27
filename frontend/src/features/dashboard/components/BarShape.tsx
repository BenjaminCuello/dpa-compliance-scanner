import { Rectangle, type BarShapeProps } from 'recharts';

/**
 * Forma de barra igual a la de Recharts. Con una forma propia, Recharts no
 * descarta las barras de ancho 0, así su valor ("0") sigue al final de la
 * barra; `Rectangle` no dibuja nada cuando el ancho es 0.
 */
export function BarShape(props: BarShapeProps) {
  return <Rectangle {...props} />;
}
