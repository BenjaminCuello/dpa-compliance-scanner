import type { ReactNode } from 'react';
import { TABLE_WRAPPER, TD, TD_NUMBER, TH } from './tableStyles';

export interface ChartTableRow {
  key: string;
  label: ReactNode;
  value: ReactNode;
}

interface ChartTableProps {
  caption: string;
  headers: [string, string];
  rows: ChartTableRow[];
}

/** Tabla de dos columnas equivalente a un gráfico. */
export function ChartTable({ caption, headers, rows }: ChartTableProps) {
  return (
    <div className={TABLE_WRAPPER}>
      <table className="w-full text-left">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-bg-soft">
          <tr>
            <th scope="col" className={TH}>
              {headers[0]}
            </th>
            <th scope="col" className={`${TH} text-right`}>
              {headers[1]}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t border-border">
              <th scope="row" className={`${TD} font-normal`}>
                {row.label}
              </th>
              <td className={TD_NUMBER}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
