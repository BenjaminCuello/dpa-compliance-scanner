#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const RESUMEN = 'coverage/coverage-summary.json';
const METRICAS = [
  ['statements', 'Sentencias'],
  ['branches', 'Ramas'],
  ['functions', 'Funciones'],
  ['lines', 'Líneas'],
];

/**
 * Imprime la cobertura como tabla Markdown, para el resumen de la ejecución en
 * GitHub Actions. Si no hay reporte, lo dice en vez de fallar: el paso corre
 * aunque las pruebas hayan fallado antes.
 */
async function main() {
  let total;

  try {
    const contenido = await readFile(new URL(`../${RESUMEN}`, import.meta.url), 'utf8');
    total = JSON.parse(contenido).total;
  } catch {
    console.log('## Cobertura\n\nNo se generó el reporte de cobertura.');
    return;
  }

  const filas = METRICAS.map(([clave, nombre]) => {
    const { pct, covered, total: cantidad } = total[clave];
    return `| ${nombre} | ${pct}% | ${covered}/${cantidad} |`;
  });

  console.log(
    ['## Cobertura', '', '| Métrica | Porcentaje | Cubierto |', '| --- | --- | --- |', ...filas, ''].join('\n'),
  );
}

await main();
