import { auditsService } from '../audits/auditsService';
import type { AuditDetail, AuditSummary } from '../audits/types';
import { latestCompletedByProject } from './aggregations';
import { mapWithConcurrency } from './concurrency';
import type { DashboardData } from './types';

/** Auditorías por página: el máximo que acepta `GET /audits`. */
export const PAGE_LIMIT = 100;
/** Páginas del historial que se piden como máximo (500 auditorías). */
export const MAX_PAGES = 5;
/** Proyectos, los auditados más recientemente, cuyo detalle se pide. */
export const MAX_DETAILS = 20;
/** Detalles que se piden en paralelo como máximo. */
export const MAX_CONCURRENT = 4;

/** Recorre el historial de a `PAGE_LIMIT` hasta `total` o `MAX_PAGES`. */
async function loadSummaries() {
  const summaries: AuditSummary[] = [];
  let total = 0;

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const list = await auditsService.list({ page, limit: PAGE_LIMIT });
    summaries.push(...list.items);
    total = list.total;
    if (summaries.length >= total || list.items.length === 0) break;
  }

  return { summaries, isTruncated: total > summaries.length };
}

/**
 * Carga lo necesario para el panel. Si falla el listado, la promesa se
 * rechaza; si falla un detalle, se omite y el resto sigue.
 */
export async function loadDashboardData(): Promise<DashboardData> {
  const { summaries, isTruncated } = await loadSummaries();
  const latest = latestCompletedByProject(summaries).slice(0, MAX_DETAILS);

  const results = await mapWithConcurrency(latest, MAX_CONCURRENT, (summary) =>
    auditsService.getById(summary.id),
  );
  const latestDetails = results.flatMap((result) =>
    result.status === 'fulfilled' ? [result.value] : ([] as AuditDetail[]),
  );

  return { summaries, latestDetails, isTruncated };
}
